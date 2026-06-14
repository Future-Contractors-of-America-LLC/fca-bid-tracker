function makeApiSuccess(data, meta = {}) {
  return {
    ok: true,
    success: true,
    data,
    meta,
  }
}

function makeApiError(code, message, details) {
  return {
    ok: false,
    success: false,
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
