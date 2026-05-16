const https = require("https");

module.exports = async function (context, req) {

  const base = process.env.BID_API_BASE;
  const key = process.env.BID_API_KEY;

  const url = `${base}?code=${encodeURIComponent(key)}`;

  try {
    const options = new URL(url);

    const apiReq = https.request(options, response => {
      let data = "";

      response.on("data", chunk => data += chunk);

      response.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: parsed
          };

        } catch (err) {
          context.res = {
            status: 500,
            body: "Invalid JSON from backend"
          };
        }
      });
    });

    apiReq.on("error", err => {
      context.res = {
        status: 500,
        body: err.toString()
      };
    });

    if (req.body) {
      apiReq.write(JSON.stringify(req.body));
    }

    apiReq.end();

  } catch (err) {
    context.res = {
      status: 500,
      body: err.toString()
    };
  }
};
