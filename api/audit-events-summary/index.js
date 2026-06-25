const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/audit-events/summary → Auricrux Central /audit-events/summary. */
module.exports = createCentralProxy("/audit-events/summary");
