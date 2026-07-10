const { createCentralPathProxy } = require("../../../_lib/proxyToCentral");
const { withSwaSessionAuth } = require("../../../_lib/swaSessionAuth.cjs");

/** Canonical project takeoff route — proxies to Auricrux Central `/projects/{projectId}/takeoffs`. */
module.exports = withSwaSessionAuth(createCentralPathProxy());
