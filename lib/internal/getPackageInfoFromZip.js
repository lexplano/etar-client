"use strict";

var yauzl = require("yauzl"),
	concat = require("concat-stream"),
	getPackageInfo = require("./getPackageInfo");

function getPackageInfoFromZip(pkg, cb) {
	yauzl.open(pkg, function (err, zipfile) {
		if (err) {
			return cb(err);
		}


		var packageInfoFound = false;
		zipfile
			.on("entry", function (entry) {
				if (entry.fileName !== "PaketoInfo.xml") {
					return;
				}

				zipfile.openReadStream(entry, function (err, readStream) {
					if (err) {
						return cb(err);
					}

					packageInfoFound = true;
					readStream
						.on("error", function () {
							cb(err);
						})
						.pipe(concat(function (data) {
							getPackageInfo(data.toString(), function (err, pkgInfo) {
								cb(err, pkgInfo);
							});
						}));
				});
			})
			.on("error", function () {
				cb(err);
			})
			.on("end", function () {
				if (!packageInfoFound) {
					cb(new Error(`No PaketoInfo.xml in ${pkg}`));
				}
			});
	});
}

module.exports = getPackageInfoFromZip;
