"use strict";

function check() {
	// GET pkg info
	throw new Error("Not implemented");
}

function download(options) {

	// GET pkg > /tmp/pkg.zip
	// extract(/tmp/pkg.zip, options.extractTo)
	// verify(/tmp/pkg.zip, options.extractTo)
	// if (!noconfirm) confirm()
	// if (!nocleanup) remove(/tmp/pkg.zip)

	console.log(options);
	throw new Error("Not implemented");
}

function verify(pkg, folder) {
	console.log(pkg, folder);
	throw new Error("Not implemented");
}

exports.check = check;
exports.download = download;
exports.extract = require("./lib/extract");
exports.verify = verify;
