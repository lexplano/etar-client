import { check } from './check.js';
import { authHeader, downloadUrl } from './internal/etarHttp.js';
import { PassThrough, Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import Fs from 'node:fs';
import Path from 'node:path';
import { validateEnv } from './internal/validateEnv.js';

function formatMb(bytes) {
  return `${Math.round(bytes / 1024 / 1024)}Mb`;
}

function formatPercent(transferred, approxSize) {
  return `${Math.round((100 * transferred) / approxSize)}%`;
}

function createProgressStream(approxSize) {
  const interval = Number(process.env.ETAR_PROGRESS_INTERVAL ?? 1000);
  let transferred = 0;
  let lastLog = Date.now();
  const stream = new PassThrough();
  stream.on('data', (chunk) => {
    transferred += chunk.length;
    if (Date.now() - lastLog >= interval) {
      lastLog = Date.now();
      console.log(`Received ~${formatPercent(transferred, approxSize)} (${formatMb(transferred)})`);
    }
  });
  return stream;
}

export async function download(storagePath) {
  validateEnv();

  const expectedPackageInfo = await check();

  if (!expectedPackageInfo) {
    throw new Error('No package available yet');
  }

  Fs.mkdirSync(storagePath, { recursive: true });
  const packagePath = Path.join(storagePath, expectedPackageInfo.packageFilename);

  if (Fs.existsSync(packagePath)) {
    throw new Error(`Package exists: ${packagePath}`);
  }

  const res = await fetch(downloadUrl(), { headers: authHeader() });

  if (!res.ok) {
    throw new Error(`TAR API download response: ${res.status} ${res.statusText}`);
  }

  await pipeline(
    Readable.fromWeb(res.body),
    createProgressStream(expectedPackageInfo.packageApproxSize),
    Fs.createWriteStream(packagePath),
  );

  return { packagePath, expectedPackageInfo };
}
