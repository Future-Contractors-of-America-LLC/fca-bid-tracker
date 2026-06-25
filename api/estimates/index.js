const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/estimates → Auricrux Central /estimates. */
module.exports = createCentralProxy("/estimates");
