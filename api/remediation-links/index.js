const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/remediation-links → Auricrux Central /remediation-links. */
module.exports = createCentralProxy("/remediation-links");
