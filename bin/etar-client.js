#!/usr/bin/env node
'use strict';

const Yargs = require('yargs');
const EtarClient = require('../index');

const ENV_VAR_MESSAGE = 'Required environment variables:\n  ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID.\n\n';

const argv = Yargs
    .usage('Usage: $0 <command> [options]')
    .command('check', 'Check if there\'s a new package available for download', (yargs) => {

        yargs
            .usage('Usage: $0 check')
            .help('help')
            .epilog(ENV_VAR_MESSAGE);
    })
    .command('download', 'Download the latest package', (yargs) => {

        yargs
            .usage('Usage: $0 download <storage path>')
            .demand(1)
            .help('help')
            .epilog(ENV_VAR_MESSAGE);
    })
    .command('verify', 'Verify downloaded zip', (yargs) => {

        yargs
            .usage('Usage: $0 verify <zip package>')
            .demand(1)
            .help('help');
    })
    .command('notify', 'Acknowledge retrieval to the TAR API', (yargs) => {

        yargs
            .usage('Usage: $0 notify <package ID>')
            .demand(1)
            .help('help')
            .epilog(ENV_VAR_MESSAGE);
    })
    .command('rotate', 'check, then verify, then notify', (yargs) => {

        yargs
            .usage('Usage: $0 rotate <storage path>')
            .demand(1)
            .help('help')
            .epilog(ENV_VAR_MESSAGE);
    })
    .epilog(ENV_VAR_MESSAGE)
    .argv;

const cmd = argv._[0];

switch (cmd) {

    case 'check':
        EtarClient.check((err, result) => {

            if (err) {
                throw err;
            }

            if (!result) {
                console.log('New package not ready yet');
                process.exit(1);
                return;
            }

            console.log('New package available', result);
        });
        break;

    case 'download':
        EtarClient.download(argv._[1], (err, pkg) => {

            if (err) {
                throw err;
            }

            console.log('Downloaded', pkg);
        });
        break;

    case 'verify':
        EtarClient.verify(argv._[1], (err) => {

            if (err) {
                throw err;
            }

            console.log('Verified');
        });
        break;

    case 'notify':
        EtarClient.notify(argv._[1], (err) => {

            if (err) {
                throw err;
            }

            console.log('Notification sent');
        });
        break;

    case 'rotate':
        EtarClient.rotate(argv._[1], (err, pkg) => {

            if (err) {
                throw err;
            }

            if (!pkg) {
                console.log('New package not ready yet');
                return;
            }

            console.log('Notification sent', pkg);
        });
        break;

    default:
        if (cmd && cmd !== 'help') {
            console.error('Invalid command:', cmd);
        }
        Yargs.showHelp();
}
