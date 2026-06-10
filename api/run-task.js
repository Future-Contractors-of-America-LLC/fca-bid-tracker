module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      message: "Proxy is working",
      timestamp: new Date().toISOString(),
      test: "FCA system loop active"
    }
  };
};
