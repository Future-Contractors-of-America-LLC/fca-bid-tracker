const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/job-cost → Auricrux Central /job-cost. */
module.exports = createCentralProxy("/job-cost");
