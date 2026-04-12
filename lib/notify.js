import { validateEnv } from './internal/validateEnv.js';
import { authHeader, notifyUrl } from './internal/etarHttp.js';

export async function notify(packageId) {
  validateEnv();

  const res = await fetch(notifyUrl(), {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id: packageId }),
  });

  if (!res.ok) {
    throw new Error(`TAR API notify response: ${res.status} ${res.statusText}`);
  }
}
