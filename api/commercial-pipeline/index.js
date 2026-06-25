const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/commercial-pipeline → Auricrux Central /commercial-pipeline. */
module.exports = createCentralProxy("/commercial-pipeline");
