"use strict";

const requiredEnvVars = ["ETAR_USERNAME", "ETAR_PASSWORD", "ETAR_USERGUID"];

function validateEnv() {
	let missingEnvVars = requiredEnvVars.filter(function (k) {
		return !process.env[k];
	});

	if (missingEnvVars.length) {
		throw new Error(`Missing in process.env: ${missingEnvVars.join(", ")}`);
	}
}

module.exports = validateEnv;
