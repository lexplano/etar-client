"use strict";

function download(options) {

	// GET pkg > /tmp/pkg.zip
	// extract(/tmp/pkg.zip, options.extractTo)
	// verify(/tmp/pkg.zip, options.extractTo)
	// if (!noconfirm) confirm()
	// if (!nocleanup) remove(/tmp/pkg.zip)

	console.log(options);
	throw new Error("Not implemented");
}

module.exports = download;
