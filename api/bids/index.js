const { createCentralProxy } = require("../_lib/proxyToCentral");
const { withSwaSessionAuth } = require("../_lib/swaSessionAuth.cjs");

const centralProxy = createCentralProxy("/bids");

/** SWA proxy: forwards /api/bids → Auricrux Central /bids with auth enforcement. */
module.exports = withSwaSessionAuth(centralProxy);
