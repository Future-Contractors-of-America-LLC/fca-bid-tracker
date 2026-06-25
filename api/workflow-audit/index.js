const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/workflow-audit → Auricrux Central /workflow-audit. */
module.exports = createCentralProxy("/workflow-audit");
