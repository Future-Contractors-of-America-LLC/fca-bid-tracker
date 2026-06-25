const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/support-tickets → Auricrux Central /support-tickets. */
module.exports = createCentralProxy("/support-tickets");
