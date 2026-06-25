const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/field-photos → Auricrux Central /field-photos. */
module.exports = createCentralProxy("/field-photos");
