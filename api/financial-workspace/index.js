const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/financial-workspace → Auricrux Central /financial-workspace. */
module.exports = createCentralProxy("/financial-workspace");
