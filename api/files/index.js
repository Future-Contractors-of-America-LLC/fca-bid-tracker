const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/files → Auricrux Central /files. */
module.exports = createCentralProxy("/files");
