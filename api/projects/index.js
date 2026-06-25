const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA-compatible proxy: forwards /api/projects → Auricrux Central /api/projects. */
module.exports = createCentralProxy("/projects");
