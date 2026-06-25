const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/files/summary → Auricrux Central /files/summary. */
module.exports = createCentralProxy("/files/summary");
