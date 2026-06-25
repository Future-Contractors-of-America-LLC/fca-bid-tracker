const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/pay-apps → Auricrux Central /pay-apps. */
module.exports = createCentralProxy("/pay-apps");
