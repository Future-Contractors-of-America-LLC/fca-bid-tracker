const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/bid-doteach-workflow → Auricrux Central /bid-doteach-workflow. */
module.exports = createCentralProxy("/bid-doteach-workflow");
