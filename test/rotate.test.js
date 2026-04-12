import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { server, state, TEST_HOST } from './fixtures/fakeServer.js';

import Fs from 'node:fs';
import Path from 'node:path';
import Tmp from 'tmp';
import { rotate } from '..';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  state.notifiedPackageId = null;
  server.resetHandlers();
});
afterAll(() => server.close());

describe('rotate', () => {
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
      ETAR_HOST: TEST_HOST,
    });

    tmpDir = Tmp.dirSync({ unsafeCleanup: true });
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    tmpDir.removeCallback();
  });

  it('notifies server', async () => {
    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'valid.zip'),
      Path.join(tmpDir.name, '20160305-20160305.zip'),
    );

    const pkgInfo = await rotate(tmpDir.name);

    expect(state.notifiedPackageId).toBe('FB8ABC12-66E4-4CD2-9500-70AA0EAA071A');

    expect(pkgInfo).toEqual({
      packageId: 'FB8ABC12-66E4-4CD2-9500-70AA0EAA071A',
      packageFilename: '20160305-20160305.zip',
      packageApproxSize: 1048576,
      documentsFrom: '2016-03-05',
      documentsTo: '2016-03-05',
    });
  });

  it('reports broken package checks', async () => {
    process.env.ETAR_USERGUID = 'no-id';

    await expect(rotate(tmpDir.name)).rejects.toThrow('Package ID not found');
  });

  it('does not notify when no package', async () => {
    process.env.ETAR_USERGUID = '423';

    const pkgInfo = await rotate(tmpDir.name);

    expect(state.notifiedPackageId).toBeNull();
    expect(pkgInfo).toBeNull();
  });

  it('reports invalid archive', async () => {
    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'no-sig.zip'),
      Path.join(tmpDir.name, '20160305-20160305.zip'),
    );

    await expect(rotate(tmpDir.name)).rejects.toThrow('Could not find exactly one entry for META-INF/signatures.xml');

    expect(state.notifiedPackageId).toBeNull();
  });

  it('reports package ID mismatch', async () => {
    process.env.ETAR_USERGUID = 'valid2';

    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'valid.zip'),
      Path.join(tmpDir.name, '20160305-20160305.zip'),
    );

    await expect(rotate(tmpDir.name)).rejects.toThrow(
      'Package ID mismatch. Server: 00000000-66E4-4CD2-9500-70AA0EAA071A, local: FB8ABC12-66E4-4CD2-9500-70AA0EAA071A',
    );

    expect(state.notifiedPackageId).toBeNull();
  });

  it('reports package not present locally', async () => {
    await expect(rotate(tmpDir.name)).rejects.toThrow(
      /^ENOENT: no such file or directory, open '.*\/20160305-20160305\.zip'$/,
    );

    expect(state.notifiedPackageId).toBeNull();
  });

  it('reports local package zip no info', async () => {
    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'no-info.zip'),
      Path.join(tmpDir.name, '20160305-20160305.zip'),
    );

    await expect(rotate(tmpDir.name)).rejects.toThrow(/^No PaketoInfo.xml in .*\/20160305-20160305\.zip$/);

    expect(state.notifiedPackageId).toBeNull();
  });
});
