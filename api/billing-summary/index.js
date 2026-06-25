const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/billing-summary → Auricrux Central /billing-summary. */
module.exports = createCentralProxy("/billing-summary");
