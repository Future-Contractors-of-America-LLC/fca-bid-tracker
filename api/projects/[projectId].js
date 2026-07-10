const { createCentralPathProxy } = require("../_lib/proxyToCentral");
const { withSwaSessionAuth } = require("../_lib/swaSessionAuth.cjs");

module.exports = withSwaSessionAuth(createCentralPathProxy());
