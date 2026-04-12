#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { check, download, verify, notify, rotate } from '../lib/index.js';

const ENV_VAR_MESSAGE = 'Required environment variables:\n  ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID.\n\n';

const cli = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command('check', "Check if there's a new package available for download", (yargs) => {
    yargs.usage('Usage: $0 check').help('help').epilog(ENV_VAR_MESSAGE);
  })
  .command('download', 'Download the latest package', (yargs) => {
    yargs.usage('Usage: $0 download <storage path>').demand(1).help('help').epilog(ENV_VAR_MESSAGE);
  })
  .command('verify', 'Verify downloaded zip', (yargs) => {
    yargs.usage('Usage: $0 verify <zip package>').demand(1).help('help');
  })
  .command('notify', 'Acknowledge retrieval to the TAR API', (yargs) => {
    yargs.usage('Usage: $0 notify <package ID>').demand(1).help('help').epilog(ENV_VAR_MESSAGE);
  })
  .command('rotate', 'check, then verify, then notify', (yargs) => {
    yargs.usage('Usage: $0 rotate <storage path>').demand(1).help('help').epilog(ENV_VAR_MESSAGE);
  })
  .epilog(ENV_VAR_MESSAGE);

const argv = cli.parse();

const cmd = argv._[0];

switch (cmd) {
  case 'check': {
    const result = await check();
    if (!result) {
      console.log('New package not ready yet');
      process.exit(1);
    }
    console.log('New package available', result);
    break;
  }

  case 'download': {
    const pkg = await download(argv._[1]);
    console.log('Downloaded', pkg);
    break;
  }

  case 'verify':
    await verify(argv._[1]);
    console.log('Verified');
    break;

  case 'notify':
    await notify(argv._[1]);
    console.log('Notification sent');
    break;

  case 'rotate': {
    const pkg = await rotate(argv._[1]);
    if (!pkg) {
      console.log('New package not ready yet');
      break;
    }
    console.log('Notification sent', pkg);
    break;
  }

  default:
    if (cmd && cmd !== 'help') {
      console.error('Invalid command:', cmd);
    }
    cli.showHelp();
}
