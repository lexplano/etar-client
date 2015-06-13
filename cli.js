#!/usr/bin/env node
"use strict";

let yargs = require("yargs"),
	etarClient = require("./index"),
	getPackageInfoFromZip = require("./lib/internal/getPackageInfoFromZip");

const ENV_VAR_MESSAGE = "Required environment variables:\n  ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID.\n\n";

let argv = yargs
	.usage("Usage: $0 <command> [options]")
	.command("check", "Check if there's a new package available for download", function (yargs) {
		yargs
			.usage("Usage: $0 check")
			.help("help")
			.epilog(ENV_VAR_MESSAGE);
	})
	.command("download", "Download the latest package", function (yargs) {
		yargs
			.usage("Usage: $0 download <storage path>")
			.demand(2)
			.help("help")
			.epilog(ENV_VAR_MESSAGE);
	})
	.command("verify", "Verify downloaded zip", function (yargs) {
		yargs
			.usage("Usage: $0 verify <zip package>")
			.demand(2)
			.help("help");
	})
	.command("extract", "Extract downloaded package", function (yargs) {
		yargs
			.usage("Usage: $0 extract <zip package> <docs folder>")
			.demand(3)
			.help("help");
	})
	.command("notify", "Acknowledge retrieval to the TAR API", function (yargs) {
		yargs
			.usage("Usage: $0 notify <package ID>")
			.demand(2)
			.help("help")
			.epilog(ENV_VAR_MESSAGE);
	})
	.epilog(ENV_VAR_MESSAGE)
	.argv;

let cmd = argv._[0];

switch (cmd) {

	case "check":
		etarClient.check(function (err, result) {
			if (err) {
				throw err;
			}

			if (!result) {
				console.log("New package not ready yet");
				process.exit(1);
				return;
			}

			console.log("New package available", result);
		});
		break;

	case "download":
		etarClient.download(argv._[1], function (err, pkg) {
			if (err) {
				throw err;
			}

			console.log("Downloaded", pkg);
		});
		break;

	case "verify":
		var pkgPath = argv._[1];
		etarClient.verify(pkgPath, function (err) {
			if (err) {
				throw err;
			}

			getPackageInfoFromZip(pkgPath, function (err, pkgInfo) {
				if (err) {
					throw err;
				}

				console.log("Verified", pkgInfo);
			});
		});
		break;

	case "extract":
		etarClient.extract(argv._[1], argv._[2], function (err) {
			if (err) {
				throw err;
			}

			console.log("Extracted");
		});
		break;

	case "notify":
		etarClient.notify(argv._[1], function (err) {
			if (err) {
				throw err;
			}

			console.log("Notification sent");
		});
		break;

	default:
		if (cmd && cmd !== "help") {
			console.error("Invalid command:", cmd);
		}
		yargs.showHelp();

}
