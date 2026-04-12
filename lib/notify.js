import Request from 'request';
import { validateEnv } from './internal/validateEnv.js';
import { auth, notifyUrl } from './internal/etarHttp.js';

export async function notify(packageId) {
  validateEnv();

  const res = await new Promise((resolve, reject) => {
    Request.post(notifyUrl(), { form: { id: packageId }, auth: auth() }, (err, response) => {
      if (err) {
        return reject(err);
      }

      resolve(response);
    });
  });

  if (res.statusCode !== 200) {
    throw new Error(`TAR API notify response: ${res.statusCode} ${res.statusMessage}`);
  }
}
