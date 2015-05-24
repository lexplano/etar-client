"use strict";

let request = require("request"),
	getPackageInfo = require("./internal/getPackageInfo");

function getCheckUrl(ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {
	return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/currentDataPacketInfo`;
}

function check(cb) {

	var missingEnvVars = ["ETAR_USERNAME", "ETAR_PASSWORD", "ETAR_USERGUID"].filter(function (k) {
		return !process.env[k];
	});

	if (missingEnvVars.length) {
		return cb(new Error(`Missing in process.env: ${missingEnvVars.join(", ")}`));
	}

	var url = getCheckUrl(process.env["ETAR_USERNAME"], process.env["ETAR_PASSWORD"], process.env["ETAR_USERGUID"]);
	request(url, function (err, res) {

		if (err) {
			return cb(err);
		}

		if (res.statusCode === 423) {
			return cb(null, null);
		}

		if (res.statusCode !== 200) {
			return cb(new Error(`TAR API check response: ${res.statusCode} ${res.statusMessage}`));
		}

		getPackageInfo(res.body, cb);
	});

}

module.exports = check;
