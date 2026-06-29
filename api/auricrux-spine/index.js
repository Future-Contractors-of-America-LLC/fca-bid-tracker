const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/auricrux-spine → Auricrux Central /auricrux-spine. */
module.exports = createCentralProxy("/auricrux-spine");
