module.exports = async function diagCanary(context, req) {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: {
      ok: true,
      route: "diag-canary",
      method: (req && req.method) || "GET",
      ts: new Date().toISOString(),
    },
  };
};