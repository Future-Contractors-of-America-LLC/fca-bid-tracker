const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/academy-lms → Auricrux Central /api/academy-lms. */
module.exports = createCentralProxy("/academy-lms");
