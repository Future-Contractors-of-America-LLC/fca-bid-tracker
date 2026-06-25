const { createCentralPathProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards dynamic route → Auricrux Central. */
module.exports = createCentralPathProxy();
