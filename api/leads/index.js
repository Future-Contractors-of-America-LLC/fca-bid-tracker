const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/leads → Auricrux Central /leads. */
module.exports = createCentralProxy("/leads");
