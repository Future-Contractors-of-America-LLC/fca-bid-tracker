const { createCentralPathProxy } = require("../../../_lib/proxyToCentral");
const { withSwaSessionAuth } = require("../../../_lib/swaSessionAuth.cjs");

/** Canonical project RFI route — proxies to Auricrux Central `/projects/{projectId}/rfis`. */
module.exports = withSwaSessionAuth(createCentralPathProxy());
