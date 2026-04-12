import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { server, state, TEST_HOST } from './fixtures/fakeServer.js';
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
      ETAR_HOST: TEST_HOST,
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
    process.env.ETAR_HOST = 'http://0.0.0.0:666';

    await expect(notify('package-id')).rejects.toThrow('connect ECONNREFUSED 0.0.0.0:666');
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
