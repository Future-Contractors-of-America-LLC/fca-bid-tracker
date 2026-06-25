const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/academy/remediation-summary → Auricrux Central /academy/remediation-summary. */
module.exports = createCentralProxy("/academy/remediation-summary");
