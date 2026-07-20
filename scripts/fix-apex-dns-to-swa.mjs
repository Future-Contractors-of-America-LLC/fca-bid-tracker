/**
 * Point futurecontractorsofamerica.com apex at the governed SWA host.
 *
 * Requires:
 *   PORKBUN_API_KEY
 *   PORKBUN_SECRET_API_KEY
 *
 * Target (matches live www CNAME):
 *   delightful-mushroom-0de67860f.7.azurestaticapps.net
 */
const domain = "futurecontractorsofamerica.com";
const swaHost = process.env.AURICRUX_SWA_DEFAULT_HOST || "delightful-mushroom-0de67860f.7.azurestaticapps.net";
const apiKey = process.env.PORKBUN_API_KEY || "";
const secretKey = process.env.PORKBUN_SECRET_API_KEY || "";

if (!apiKey || !secretKey) {
  console.error("Set PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY before running.");
  console.error("Manual Porkbun fix:");
  console.error(`  1) Delete apex A records (commonly 75.2.70.75 / 99.83.190.102)`);
  console.error(`  2) Add ALIAS/ANAME @ -> ${swaHost}`);
  process.exit(1);
}

const auth = { apikey: apiKey, secretapikey: secretKey };

async function porkbun(path, body = {}) {
  const response = await fetch(`https://api.porkbun.com/api/json/v3${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...auth, ...body }),
  });
  const json = await response.json();
  if (json.status !== "SUCCESS") {
    throw new Error(`${path} failed: ${JSON.stringify(json)}`);
  }
  return json;
}

const records = await porkbun(`/dns/retrieve/${domain}`);
const apexRecords = (records.records || []).filter((row) => {
  const name = String(row.name || "").toLowerCase();
  return name === domain || name === "" || name === "@";
});

console.log(`Found ${apexRecords.length} apex record(s).`);
for (const row of apexRecords) {
  if (["A", "AAAA", "ALIAS", "CNAME"].includes(String(row.type || "").toUpperCase())) {
    console.log(`Deleting ${row.type} id=${row.id} content=${row.content}`);
    await porkbun(`/dns/delete/${domain}/${row.id}`);
  }
}

console.log(`Creating ALIAS @ -> ${swaHost}`);
await porkbun(`/dns/create/${domain}`, {
  type: "ALIAS",
  name: "",
  content: swaHost,
  ttl: "600",
});

console.log("Apex ALIAS created. Allow DNS propagation, then re-check:");
console.log(`  curl -I https://${domain}/deployment-status.json`);
