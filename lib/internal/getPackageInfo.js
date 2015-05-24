"use strict";

let xml2js = require("xml2js");

function stripDate(dateString) {
	if (!dateString.match(/^\d\d\d\d-\d\d\-\d\d$/)) {
		console.warn("Bad date string", dateString);
		return dateString;
	}
	return dateString.replace(/-/g, "");
}

function getPackageInfo(xmlString, cb) {
	xml2js.parseString(xmlString, function (err, xmlData) {
		if (err) {
			return cb(err);
		}

		if (!xmlData.paketoInfo["ID"] || xmlData.paketoInfo["ID"].length !== 1) {
			console.log("Package XML data", xmlData);
			return cb(new Error("Package ID not found"));
		}

		if (!xmlData.paketoInfo["TeisėsAktaiNuo"] || xmlData.paketoInfo["TeisėsAktaiNuo"].length !== 1) {
			console.log("Package XML data", xmlData);
			return cb(new Error("Start date not found"));
		}

		if (!xmlData.paketoInfo["TeisėsAktaiIki"] || xmlData.paketoInfo["TeisėsAktaiIki"].length !== 1) {
			console.log("Package XML data", xmlData);
			return cb(new Error("End date not found"));
		}

		var packageId = xmlData.paketoInfo["ID"][0],
			documentsFrom = xmlData.paketoInfo["TeisėsAktaiNuo"][0],
			documentsTo = xmlData.paketoInfo["TeisėsAktaiIki"][0],
			packageFilename = `${stripDate(documentsFrom)}-${stripDate(documentsTo)}.zip`;

		cb(null, {packageId, packageFilename, documentsFrom, documentsTo});
	});
}

module.exports = getPackageInfo;
