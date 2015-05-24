"use strict";

let yauzl = require("yauzl"),
	fs = require("fs"),
	mkdirp = require("mkdirp"),
	path = require("path");

function extract(pkg, folder) {

	yauzl.open(pkg, function(err, zipfile) {
		if (err) throw err;
		zipfile.on("entry", function(entry) {
			if (entry.fileComment !== "application/zip") {
				console.log("Ignoring", entry.fileName);
				return;
			}

			if (!entry.fileName.match(/^[0-9]{8}-[0-9a-f]{32}\.zip$/)) {
				console.warn("Ignoring", entry.fileName);
				return;
			}

			let outFn = entry.fileName.substr(9),
				outPath = path.join(folder, outFn.substr(0,2), outFn.substr(2, 2));

			zipfile.openReadStream(entry, function(err, readStream) {
				if (err) throw err;
				mkdirp.sync(outPath);
				var fn = path.join(outPath, outFn);
				readStream.pipe(fs.createWriteStream(fn));
			});
		});

		zipfile.on("end", function () {
			console.log("Done");
		});
	});
}

module.exports = extract;
