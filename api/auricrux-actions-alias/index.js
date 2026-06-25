const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/auricrux-actions → Auricrux Central /auricrux-actions. */
module.exports = createCentralProxy("/auricrux-actions");
