module.exports = async function (context, req) {
  const result = {
    message: "Proxy is working",
    status: "ACTIVE",
    timestamp: new Date().toISOString()
  };

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result)
  };
};
