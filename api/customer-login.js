module.exports = async function (context, req) {
  const { buildAuthBoundary, buildServerSession, createSessionCookie } = await import('./auth-boundary.js')
  const { validateCustomerCredentials } = await import('./customer-account-store.js')

  const method = (req.method || 'GET').toUpperCase()
  const authBoundary = buildAuthBoundary()

  if (method !== 'POST') {
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: {
        ok: true,
        route: 'customer-login',
        activeMode: authBoundary.activeMode,
        authBoundary,
        message: authBoundary.productionAuthReady
          ? 'POST credentials to authenticate against managed FCA customer accounts.'
          : 'POST credentials to authenticate against FCA customer accounts. Managed auth is not fully promoted yet, so bounded fallback behavior may still apply.',
      },
    }
    return
  }

  const body = req.body || {}
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '').trim()

  const account = validateCustomerCredentials(email, password)

  if (!account) {
    context.res = {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: {
        ok: false,
        error: 'Invalid FCA customer credentials.',
        route: 'customer-login',
        activeMode: authBoundary.activeMode,
        authBoundary,
      },
    }
    return
  }

  const { cookie } = createSessionCookie(account)
  const session = buildServerSession(account)

  context.res = {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Set-Cookie': cookie,
    },
    body: {
      ok: true,
      route: 'customer-login',
      activeMode: authBoundary.activeMode,
      account: session.customer,
      session,
      authBoundary,
    },
  }
}
