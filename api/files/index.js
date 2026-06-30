const { createCentralProxy } = require("../_lib/proxyToCentral");
const { withSwaSessionAuth } = require("../_lib/swaSessionAuth.cjs");

module.exports = withSwaSessionAuth(createCentralProxy("/files"));
