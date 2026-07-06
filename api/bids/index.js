const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/bids → Auricrux Central /bids. */
module.exports = createCentralProxy("/bids");
