"use strict";

let request = require("request"),
	getPackageInfo = require("./internal/getPackageInfo");

function getCheckUrl(ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {
	return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/currentDataPacketInfo`;
}

function check(cb) {

	["ETAR_USERNAME", "ETAR_PASSWORD", "ETAR_USERGUID"].forEach(function (k) {
		if (!process.env[k]) {
			throw new Error(`process.env.${k} is empty`);
		}
	});

	var url = getCheckUrl(process.env["ETAR_USERNAME"], process.env["ETAR_PASSWORD"], process.env["ETAR_USERGUID"]);
	request(url, function (err, res) {

		if (cb && err) {
			return cb(err);
		}

		if (err) {
			throw err;
		}

		// @todo: handle 423

		getPackageInfo(res.body, function (err, packageData) {
			if (cb) {
				return cb(err, packageData);
			}

			if (err) {
				throw err;
			}

			console.log(packageData);
		});
	});

}

module.exports = check;
