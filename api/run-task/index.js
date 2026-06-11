module.exports = async function (context, req) {
  try {
    const executeCode = process.env.AURICRUX_EXEC_CODE || "";

    const res = await fetch(
      "https://auricrux-central.azurewebsites.net/api/execute?code=" + encodeURIComponent(executeCode),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target: "fca-frontend",
          task: "Provide system status summary from Auricrux-Central execute endpoint."
        })
      }
    );

    const text = await res.text();

    return {
      status: res.status,
      headers: {
        "Content-Type": "text/plain"
      },
      body: text && text.trim() ? text : "EMPTY RESPONSE FROM AURICRUX-CENTRAL EXECUTE"
    };
  } catch (err) {
    return {
      status: 500,
      headers: {
        "Content-Type": "text/plain"
      },
      body: "Proxy error: " + err.message
    };
  }
};
