import { validateEnv } from './internal/validateEnv.js';
import { authHeader, checkUrl } from './internal/etarHttp.js';
import { getPackageInfo } from './internal/getPackageInfo.js';

export async function check() {
  validateEnv();

  const res = await fetch(checkUrl(), { headers: authHeader() });

  if (res.status === 423) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`TAR API check response: ${res.status} ${res.statusText}`);
  }

  return getPackageInfo(await res.text());
}
