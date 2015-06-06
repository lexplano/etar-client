"use strict";

var asicVerify = require("asic-verify");

function verify(pkg, cb) {
	// @todo: verify signed with correct cert?
	// @todo: verify extracted files?
	asicVerify(pkg, function (err) {
		console.log("ASiC-e checked.");
		cb(err);
	});
}

module.exports = verify;
