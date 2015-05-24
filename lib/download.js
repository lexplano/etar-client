"use strict";

let check = require("./check"),
	request = require("request"),
	withProgress = require("request-progress"),
	fs = require("fs"),
	path = require("path");

function getDownloadUrl(ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {
	return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/currentDataPacket`;
}

function download(options, cb) {

	check(function (err, expectedPkgInfo) {

		if (err) {
			return cb(err);
		}

		let url = getDownloadUrl(process.env["ETAR_USERNAME"], process.env["ETAR_PASSWORD"], process.env["ETAR_USERGUID"]);

		withProgress(request(url), {throttle: 1000, delay: 1000})
			.on("response", function (res) {

				if (res.statusCode !== 200) {
					throw new Error(`TAR API download response: ${res.statusCode} ${res.statusMessage}`);
				}

				// @todo: don't overwrite?
				// @todo: write to _packages / .packages?
			})
			.on("progress", function (progress) {
				let receivedMb = Math.round(progress.received / 1024 / 1024);
				let receivedPercent = Math.round(100 * progress.received / expectedPkgInfo.packageApproxSize);
				console.log(`Received ~${receivedPercent}% (${receivedMb}Mb)`);
			})
			.on("error", function () {
				cb(err);
			})
			.pipe(fs.createWriteStream(path.join(options.extractTo, expectedPkgInfo.packageFilename)))
			.on("error", function () {
				cb(err);
			})
			.on("close", function () {
				 //@todo extract(/tmp/pkg.zip, options.extractTo)
				 //@todo verify(/tmp/pkg.zip, options.extractTo)
				 //@todo if (!noconfirm) notify()
				 //@todo if (!nocleanup) remove(pkg.zip)
				console.log("close");
			});

	});
}

module.exports = download;
