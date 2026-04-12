import Path from 'node:path';
import { check } from './check.js';
import { verify } from './verify.js';
import { getPackageInfoFromZip } from './internal/getPackageInfoFromZip.js';
import { notify } from './notify.js';

export async function rotate(storagePath) {
  const pkgInfo = await check();

  if (!pkgInfo) {
    return null;
  }

  const pkgPath = Path.join(storagePath, pkgInfo.packageFilename);

  const infoFromZip = await getPackageInfoFromZip(pkgPath);

  if (pkgInfo.packageId !== infoFromZip.packageId) {
    throw new Error(`Package ID mismatch. Server: ${pkgInfo.packageId}, local: ${infoFromZip.packageId}`);
  }

  await verify(pkgPath);
  await notify(pkgInfo.packageId);

  return pkgInfo;
}
