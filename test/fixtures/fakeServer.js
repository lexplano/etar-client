import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import Fs from 'node:fs';
import Path from 'node:path';

const __dirname = import.meta.dirname;

const ETAR_HOST = 'https://www.e-tar.lt';

export const state = {
  notifiedPackageId: null,
};

function checkAuth(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) {
    return false;
  }

  const decoded = Buffer.from(auth.slice(6), 'base64').toString();
  const colonIdx = decoded.indexOf(':');
  const user = decoded.slice(0, colonIdx);
  const pass = decoded.slice(colonIdx + 1);
  return user === 'valid-user' && pass === 'valid-password';
}

function unauthorized() {
  return new HttpResponse(null, {
    status: 401,
    statusText: 'Unauthorized',
    headers: { 'WWW-Authenticate': 'Basic realm="Test"' },
  });
}

const handlers = [
  http.get(`${ETAR_HOST}/portal/DataExportAPI/:userguid/currentDataPacketInfo`, ({ request, params }) => {
    if (!checkAuth(request)) {
      return unauthorized();
    }

    const { userguid } = params;

    if (userguid === '423') {
      return new HttpResponse('New package not ready yet', { status: 423 });
    }

    if (userguid === '503') {
      return new HttpResponse('Maintenance', { status: 503, statusText: 'Temporarily Unavailable' });
    }

    const fixtureName = userguid === 'download-503' || userguid === 'notify-503' ? 'valid' : userguid;
    const xmlContent = Fs.readFileSync(Path.join(__dirname, 'packageInfo', `${fixtureName}.xml`));
    return new HttpResponse(xmlContent, { headers: { 'Content-Type': 'application/xml' } });
  }),

  http.get(`${ETAR_HOST}/portal/DataExportAPI/:userguid/currentDataPacket`, ({ request, params }) => {
    if (!checkAuth(request)) {
      return unauthorized();
    }

    const { userguid } = params;

    if (userguid === 'download-503') {
      return new HttpResponse('Maintenance', { status: 503, statusText: 'Temporarily Unavailable' });
    }

    const zipContent = Fs.readFileSync(Path.join(__dirname, 'packages', `${userguid}.zip`));
    return new HttpResponse(zipContent, { headers: { 'Content-Type': 'application/zip' } });
  }),

  http.post(`${ETAR_HOST}/portal/DataExportAPI/:userguid/packetReceptionConfirmation`, async ({ request, params }) => {
    if (!checkAuth(request)) {
      return unauthorized();
    }

    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      throw new Error('Invalid notify request');
    }

    state.notifiedPackageId = id;

    const { userguid } = params;

    if (userguid === '423' || userguid === 'notify-503') {
      return new HttpResponse('Maintenance', { status: 503, statusText: 'Temporarily Unavailable' });
    }

    return HttpResponse.json({ success: true });
  }),
];

export const server = setupServer(...handlers);
