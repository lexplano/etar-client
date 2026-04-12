import { check } from './check.js';
import { auth, downloadUrl } from './internal/etarHttp.js';
import Request from 'request';
import WithProgress from 'request-progress';
import Fs from 'node:fs';
import Path from 'node:path';
import { validateEnv } from './internal/validateEnv.js';

export async function download(storagePath) {
  validateEnv();

  const expectedPackageInfo = await check();

  if (!expectedPackageInfo) {
    throw new Error('No package available yet');
  }

  // @todo: mkdirp?
  const packagePath = Path.join(storagePath, expectedPackageInfo.packageFilename);

  if (Fs.existsSync(packagePath)) {
    throw new Error(`Package exists: ${packagePath}`);
  }

  await new Promise((resolve, reject) => {
    const outputStream = Fs.createWriteStream(packagePath);
    const request = WithProgress(Request.get(downloadUrl(), { auth: auth() }), { throttle: 1000, delay: 1000 });

    request
      .on('response', (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`TAR API download response: ${res.statusCode} ${res.statusMessage}`));
          return;
        }

        request.on('error', reject).pipe(outputStream).on('error', reject).on('close', resolve);
      })
      .on('progress', (progress) => {
        // @todo: any way to test this?
        const receivedMb = Math.round(progress.size.transferred / 1024 / 1024);
        const receivedPercent = Math.round((100 * progress.size.transferred) / expectedPackageInfo.packageApproxSize);
        console.log(`Received ~${receivedPercent}% (${receivedMb}Mb)`);
      });
  });

  return { packagePath, expectedPackageInfo };
}
