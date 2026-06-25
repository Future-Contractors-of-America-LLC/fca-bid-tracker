const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/field-schedule → Auricrux Central /field-schedule. */
module.exports = createCentralProxy("/field-schedule");
