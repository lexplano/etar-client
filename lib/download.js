"use strict";

let check = require("./check"),
	request = require("request"),
	withProgress = require("request-progress"),
	fs = require("fs"),
	path = require("path"),
	validateEnv = require("./internal/validateEnv");

function getDownloadUrl(ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {
	return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/currentDataPacket`;
}

function download(storagePath, cb) {

	try {
		validateEnv();
	} catch (err) {
		return cb(err);
	}

	check(function (err, expectedPackageInfo) {

		if (err) {
			return cb(err);
		}

		if (!expectedPackageInfo) {
			return cb(new Error("No package available yet"));
		}

		let packagePath = path.join(storagePath, expectedPackageInfo.packageFilename);

		let url = getDownloadUrl(process.env["ETAR_USERNAME"], process.env["ETAR_PASSWORD"], process.env["ETAR_USERGUID"]);

		if (fs.existsSync(packagePath)) {
			return cb(new Error("Package exists: " + packagePath));
		}

		let outputStream = fs.createWriteStream(packagePath);

		withProgress(request(url), {throttle: 1000, delay: 1000})
			.on("response", function (res) {

				if (res.statusCode !== 200) {
					throw new Error(`TAR API download response: ${res.statusCode} ${res.statusMessage}`);
				}

				// @todo: don't overwrite?
				// @todo: mkdirp
			})
			.on("progress", function (progress) {
				let receivedMb = Math.round(progress.received / 1024 / 1024);
				let receivedPercent = Math.round(100 * progress.received / expectedPackageInfo.packageApproxSize);
				console.log(`Received ~${receivedPercent}% (${receivedMb}Mb)`);
			})
			.on("error", function (err) {
				cb(err);
			})
			.pipe(outputStream)
			.on("error", function (err) {
				cb(err);
			})
			.on("close", function () {
				cb(null, {
					packagePath: packagePath,
					expectedPackageInfo: expectedPackageInfo
				});
			});

	});
}

module.exports = download;
