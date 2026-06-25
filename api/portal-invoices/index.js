const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/portal-invoices → Auricrux Central /portal-invoices. */
module.exports = createCentralProxy("/portal-invoices");
