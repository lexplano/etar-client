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
	.command("download", "Download, extract and verify the results", function (yargs) {
		yargs
			.usage("Usage: $0 download [options]")
			.option("extract-to", {
				"describe": "Folder to copy the extracted documents to (will discard the downloaded package upon successful extraction)",
				"type": "string",
				"required": true
			})
			.option("cleanup", {
				"describe": "Remove temporary files",
				"default": true,
				"type": "boolean"
			})
			.option("confirm-reception", {
				"describe": "Acknowledge retrieval to the TAR API upon success",
				"default": true,
				"type": "boolean"
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
	.epilog(ENV_VAR_MESSAGE)
	.argv;

let cmd = argv._[0];

switch (cmd) {

	case "download":
		etarClient.download({
			extractTo: argv.extractTo,
			confirmReception: argv.confirmReception
		});
		break;

	case "check":
		etarClient.check(function (err, result) {
			if (err) {
				throw err;
			}

			if (!result) {
				console.log("New package not ready yet");
				return;
			}

			console.log("New package available", result);
		});
		break;

	case "extract":
		etarClient.extract(argv._[1], argv._[2]);
		break;

	case "verify":
		etarClient.verify(argv._[1], argv._[2]);
		break;

	default:
		if (cmd && cmd !== "help") {
			console.error("Invalid command:", cmd);
		}
		yargs.showHelp();

}
