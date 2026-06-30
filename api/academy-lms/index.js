const { createCentralProxy } = require("../_lib/proxyToCentral");
const { withSwaSessionAuth } = require("../_lib/swaSessionAuth.cjs");

const centralProxy = createCentralProxy("/academy-lms");

/** SWA proxy: forwards /api/academy-lms → Auricrux Central with auth enforcement. */
module.exports = withSwaSessionAuth(centralProxy);
