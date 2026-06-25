const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/closeout-packages → Auricrux Central /closeout-packages. */
module.exports = createCentralProxy("/closeout-packages");
