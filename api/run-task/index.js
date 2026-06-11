module.exports = async function (context, req) {
  return {
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    },
    body: "RUN TASK OK"
  };
};
