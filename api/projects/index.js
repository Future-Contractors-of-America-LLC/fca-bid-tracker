const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/projects → Auricrux Central /projects. */
module.exports = createCentralProxy("/projects");
