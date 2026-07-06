const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/proposals → Auricrux Central /proposals. */
module.exports = createCentralProxy("/proposals");
