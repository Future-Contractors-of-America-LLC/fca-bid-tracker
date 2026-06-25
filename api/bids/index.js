const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA-compatible proxy: forwards /api/bids → Auricrux Central /api/bids. */
module.exports = createCentralProxy("/bids");
