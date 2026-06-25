const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/portal-messages → Auricrux Central /portal-messages. */
module.exports = createCentralProxy("/portal-messages");
