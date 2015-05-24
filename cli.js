"use strict";

let yargs = require("yargs"),
	etarClient = require("./index");

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
			.usage("Usage: $0 download [options]")
			.option("storage-path", {
				"describe": "Folder where extracted documents are stored (package will be saved in .packages)",
				"type": "string",
				"required": true
			})
			.help("help")
			.epilog(ENV_VAR_MESSAGE);
	})
	.command("extract", "Extract downloaded package", function (yargs) {
		yargs
			.usage("Usage: $0 extract <zip package> <docs folder>")
			.demand(3)
			.help("help");
	})
	.command("verify", "Verify extracted package", function (yargs) {
		yargs
			.usage("Usage: $0 verify <zip package> <docs folder>")
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
				// @todo: correct exit code
				console.log("New package not ready yet");
				return;
			}

			console.log("New package available", result);
		});
		break;

	case "download":
		etarClient.download({
			storagePath: argv.storagePath
		}, function (err, pkg) {
			if (err) {
				throw err;
			}

			console.log("Downloaded", pkg);
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

	case "verify":
		etarClient.verify(argv._[1], argv._[2], function (err) {
			if (err) {
				throw err;
			}

			console.log("Extracted contents verified");
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
