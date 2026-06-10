export function normalizeEnabledProducts(enabledProducts = {}) {
  return {
    saas: enabledProducts?.saas !== false,
    lms: enabledProducts?.lms !== false,
    auricrux: enabledProducts?.auricrux !== false,
  };
}

export function hasProductEntitlement(session, product) {
  if (!session || !product) return false;
  const normalizedProducts = normalizeEnabledProducts(session.enabledProducts);
  return normalizedProducts[product] === true;
}

export function forbiddenProductResponse(product) {
  const productLabel = product === "lms"
    ? "LMS"
    : product === "saas"
      ? "SaaS"
      : product === "auricrux"
        ? "Auricrux"
        : "required";

  return {
    status: 403,
    jsonBody: {
      ok: false,
      error: `Customer does not have ${productLabel} access.`,
      requiredProduct: product,
    },
  };
}

export function requireProductEntitlement(session, product) {
  if (!hasProductEntitlement(session, product)) {
    return {
      ok: false,
      response: forbiddenProductResponse(product),
    };
  }

  return {
    ok: true,
  };
}
