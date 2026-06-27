const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/auricrux/speak → Auricrux Central /auricrux/speak. */
module.exports = createCentralProxy("/auricrux/speak");
