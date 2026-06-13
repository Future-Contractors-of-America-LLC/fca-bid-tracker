function assertValid(schema, payload) {
  const result = schema.safeParse(payload)

  if (!result.success) {
    const error = new Error('Validation failed')
    error.statusCode = 400
    error.code = 'VALIDATION_FAILED'
    error.details = result.error.flatten()
    throw error
  }

  return result.data
}

module.exports = {
  assertValid,
}
