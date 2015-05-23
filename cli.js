"use strict";

let yargs = require("yargs"),
	etarClient = require("./index");

var ENV_VAR_MESSAGE = "Required environment variables:\n  ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID.\n\n";

let argv = yargs
	.usage("Usage: $0 <command> [options]")
	.command("check", "Check if there's a new package available for download", function (yargs) {
		yargs
			.usage("Usage: $0 check")
			.help("help")
			.epilog(ENV_VAR_MESSAGE);
	})
	.command("download", "Download and extract the new package", function (yargs) {
		yargs
			.usage("Usage: $0 download [options]")
			.option("extract-to", {
				"describe": "Folder to copy the extracted documents to (will discard the downloaded package upon successful extraction)",
				"type": "string"
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
			.usage("Usage: $0 extract <package> <folder>")
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
		etarClient.check();
		break;

	case "extract":
		etarClient.extract(argv._[1], argv._[2]);
		break;

	default:
		if (cmd && cmd !== "help") {
			console.error("Invalid command:", cmd);
		}
		yargs.showHelp();

}
