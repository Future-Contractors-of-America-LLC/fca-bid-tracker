const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/field-tasks → Auricrux Central /field-tasks. */
module.exports = createCentralProxy("/field-tasks");
