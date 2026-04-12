import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createFakeServer } from './fixtures/fakeServer.js';
import { check } from '..';

function testErrorFixture(fixture, errorMessage) {
  return async () => {
    process.env.ETAR_USERGUID = fixture;
    await expect(check()).rejects.toThrow(errorMessage);
  };
}

describe('check', () => {
  let server;
  let originalEnv;
  let originalConsoleLog;

  beforeEach(() => {
    ({ server } = createFakeServer());
    server.listen({ onUnhandledRequest: 'bypass' });
    originalEnv = Object.assign({}, process.env);
    originalConsoleLog = console.log;
    console.log = () => {};

    Object.assign(process.env, {
      ETAR_USERNAME: 'valid-user',
      ETAR_PASSWORD: 'valid-password',
      ETAR_USERGUID: 'valid',
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    server.close();
  });

  it('returns package info JSON', async () => {
    const packageInfo = await check();

    expect(packageInfo).toEqual({
      packageId: 'FB8ABC12-66E4-4CD2-9500-70AA0EAA071A',
      packageFilename: '20160305-20160305.zip',
      packageApproxSize: 1048576,
      documentsFrom: '2016-03-05',
      documentsTo: '2016-03-05',
    });
  });

  it('reports network errors', async () => {
    server.use(
      http.get('https://www.e-tar.lt/portal/DataExportAPI/:userguid/currentDataPacketInfo', () =>
        HttpResponse.error(),
      ),
    );

    await expect(check()).rejects.toThrow();
  });

  it('reports missing env vars', async () => {
    delete process.env.ETAR_USERNAME;

    await expect(check()).rejects.toThrow('Missing in process.env: ETAR_USERNAME');
  });

  it('returns null when new package not ready yet', async () => {
    process.env.ETAR_USERGUID = '423';

    const packageInfo = await check();

    expect(packageInfo).toBeNull();
  });

  it('reports server errors', async () => {
    process.env.ETAR_USERGUID = '503';

    await expect(check()).rejects.toThrow('TAR API check response: 503 Temporarily Unavailable');
  });

  it('reports auth errors', async () => {
    process.env.ETAR_USERNAME = 'invalid';

    await expect(check()).rejects.toThrow('TAR API check response: 401 Unauthorized');
  });

  it('reports XML errors', testErrorFixture('invalid-xml', 'Unclosed root tag'));

  it('reports missing end date', testErrorFixture('no-end-date', 'End date not found'));

  it('reports multiple end dates', testErrorFixture('multi-end-date', 'End date not found'));

  it('invalid end date', testErrorFixture('invalid-end-date', 'Invalid end date'));

  it('reports missing id', testErrorFixture('no-id', 'Package ID not found'));

  it('reports multiple ids ', testErrorFixture('multi-id', 'Package ID not found'));

  it('missing size', testErrorFixture('no-size', 'Package size not found'));

  it('multiple size entries', testErrorFixture('multi-size', 'Package size not found'));

  it('missing start date', testErrorFixture('no-start-date', 'Start date not found'));

  it('multiple start dates', testErrorFixture('multi-start-date', 'Start date not found'));

  it('invalid start date', testErrorFixture('invalid-start-date', 'Invalid start date'));
});
