import Request from 'request';
import { validateEnv } from './internal/validateEnv.js';
import { auth, checkUrl } from './internal/etarHttp.js';
import { getPackageInfo } from './internal/getPackageInfo.js';

export async function check() {
  validateEnv();

  const res = await new Promise((resolve, reject) => {
    Request.get(checkUrl(), { auth: auth() }, (err, response) => {
      if (err) {
        return reject(err);
      }

      resolve(response);
    });
  });

  if (res.statusCode === 423) {
    return null;
  }

  if (res.statusCode !== 200) {
    throw new Error(`TAR API check response: ${res.statusCode} ${res.statusMessage}`);
  }

  return getPackageInfo(res.body);
}
