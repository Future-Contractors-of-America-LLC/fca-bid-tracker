const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/warranty-cases → Auricrux Central /warranty-cases. */
module.exports = createCentralProxy("/warranty-cases");
