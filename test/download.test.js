import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { server, state } from './fixtures/fakeServer.js';

import Fs from 'node:fs';
import Os from 'node:os';
import Path from 'node:path';
import { download } from '..';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  state.notifiedPackageId = null;
  server.resetHandlers();
});
afterAll(() => server.close());

describe('download', () => {
  let originalEnv;
  let originalConsoleLog;
  let tmpDir;

  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
    originalConsoleLog = console.log;
    console.log = () => {};

    Object.assign(process.env, {
      ETAR_USERNAME: 'valid-user',
      ETAR_PASSWORD: 'valid-password',
      ETAR_USERGUID: 'valid',
    });

    tmpDir = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'etar-'));
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
  });

  it('downloads the package', async () => {
    process.env.ETAR_PROGRESS_INTERVAL = '1';

    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));

    const { packagePath, expectedPackageInfo } = await download(tmpDir);

    expect(logs.some((msg) => msg.startsWith('Received ~'))).toBe(true);
    expect(packagePath).toContain('20160305-20160305.zip');

    const downloaded = Fs.readFileSync(packagePath);
    const valid = Fs.readFileSync(Path.join(import.meta.dirname, 'fixtures', 'packages', 'valid.zip'));
    expect(downloaded.equals(valid)).toBe(true);

    expect(expectedPackageInfo).toEqual({
      packageId: 'FB8ABC12-66E4-4CD2-9500-70AA0EAA071A',
      packageFilename: '20160305-20160305.zip',
      packageApproxSize: 1048576,
      documentsFrom: '2016-03-05',
      documentsTo: '2016-03-05',
    });
  });

  it('reports broken package checks', async () => {
    process.env.ETAR_USERGUID = 'no-id';

    await expect(download(tmpDir)).rejects.toThrow('Package ID not found');
  });

  it('reports no package yet', async () => {
    process.env.ETAR_USERGUID = '423';

    await expect(download(tmpDir)).rejects.toThrow('No package available yet');
  });

  it('reports double download', async () => {
    const { packagePath } = await download(tmpDir);

    await expect(download(tmpDir)).rejects.toThrow(`Package exists: ${packagePath}`);
  });

  it('reports network errors');

  it('reports missing env vars', async () => {
    delete process.env.ETAR_USERNAME;

    await expect(download(tmpDir)).rejects.toThrow('Missing in process.env: ETAR_USERNAME');
  });

  it('reports server errors', async () => {
    process.env.ETAR_USERGUID = 'download-503';

    await expect(download(tmpDir)).rejects.toThrow('TAR API download response: 503 Temporarily Unavailable');
  });

  it('reports file writing errors');
});
