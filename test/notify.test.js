import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, state } from './fixtures/fakeServer.js';
import { notify } from '..';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  state.notifiedPackageId = null;
  server.resetHandlers();
});
afterAll(() => server.close());

describe('notify', () => {
  let envCopy;

  beforeEach(() => {
    envCopy = Object.assign({}, process.env);

    Object.assign(process.env, {
      ETAR_USERNAME: 'valid-user',
      ETAR_PASSWORD: 'valid-password',
      ETAR_USERGUID: 'valid-userguid',
    });
  });

  afterEach(() => {
    process.env = envCopy;
  });

  it('notifies server', async () => {
    const packageId = `package-id-${Date.now()}`;
    await notify(packageId);

    expect(state.notifiedPackageId).toBe(packageId);
  });

  it('reports network errors', async () => {
    server.use(
      http.post(
        'https://www.e-tar.lt/portal/DataExportAPI/:userguid/packetReceptionConfirmation',
        () => HttpResponse.error(),
      ),
    );

    await expect(notify('package-id')).rejects.toThrow();
  });

  it('reports missing env vars', async () => {
    delete process.env.ETAR_USERNAME;

    await expect(notify('package-id')).rejects.toThrow('Missing in process.env: ETAR_USERNAME');
  });

  it('reports auth errors', async () => {
    process.env.ETAR_USERNAME = 'invalid';

    await expect(notify('package-id')).rejects.toThrow('TAR API notify response: 401 Unauthorized');
  });
});
