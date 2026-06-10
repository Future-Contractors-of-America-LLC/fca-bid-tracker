module.exports = async function (context, req) {
  const result = {
    message: "Proxy is working",
    time: new Date().toISOString(),
    status: "ACTIVE"
  };

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(result)
  };
};
