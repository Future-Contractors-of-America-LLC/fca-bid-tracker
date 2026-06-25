const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/auricrux → Auricrux Central /auricrux. */
module.exports = createCentralProxy("/auricrux");
