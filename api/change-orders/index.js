const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/change-orders → Auricrux Central /change-orders. */
module.exports = createCentralProxy("/change-orders");
