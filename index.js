"use strict";

function check() {
	// GET pkg info
	throw new Error("Not implemented");
}

function download(options) {

	// GET pkg
	// read metadata from pkg
	// if (!noconfirm) confirm()
	// if (!noextract) extract()
	// ?? remove tmp archive?

	console.log(options);
	throw new Error("Not implemented");
}

function extract(pkg, folder) {
	console.log(pkg, folder);
	throw new Error("Not implemented");
}

exports.check = check;
exports.download = download;
exports.extract = extract;
