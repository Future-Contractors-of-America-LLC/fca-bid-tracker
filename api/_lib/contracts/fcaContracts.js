function makeApiSuccess(data, meta = {}) {
  return {
    ok: true,
    data,
    meta,
  }
}

function makeApiError(code, message, details) {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
    },
  }
}

module.exports = {
  makeApiSuccess,
  makeApiError,
}
