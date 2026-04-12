import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createFakeServer } from './fixtures/fakeServer.js';

import Fs from 'node:fs';
import Os from 'node:os';
import Path from 'node:path';
import { rotate } from '..';

describe('rotate', () => {
  let server;
  let state;
  let originalEnv;
  let originalConsoleLog;
  let tmpDir;

  beforeEach(() => {
    ({ server, state } = createFakeServer());
    server.listen({ onUnhandledRequest: 'bypass' });
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
    server.close();
  });

  it('notifies server', async () => {
    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'valid.zip'),
      Path.join(tmpDir, '20160305-20160305.zip'),
    );

    const pkgInfo = await rotate(tmpDir);

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

    await expect(rotate(tmpDir)).rejects.toThrow('Package ID not found');
  });

  it('does not notify when no package', async () => {
    process.env.ETAR_USERGUID = '423';

    const pkgInfo = await rotate(tmpDir);

    expect(state.notifiedPackageId).toBeNull();
    expect(pkgInfo).toBeNull();
  });

  it('reports invalid archive', async () => {
    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'no-sig.zip'),
      Path.join(tmpDir, '20160305-20160305.zip'),
    );

    await expect(rotate(tmpDir)).rejects.toThrow('Could not find exactly one entry for META-INF/signatures.xml');

    expect(state.notifiedPackageId).toBeNull();
  });

  it('reports package ID mismatch', async () => {
    process.env.ETAR_USERGUID = 'valid2';

    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'valid.zip'),
      Path.join(tmpDir, '20160305-20160305.zip'),
    );

    await expect(rotate(tmpDir)).rejects.toThrow(
      'Package ID mismatch. Server: 00000000-66E4-4CD2-9500-70AA0EAA071A, local: FB8ABC12-66E4-4CD2-9500-70AA0EAA071A',
    );

    expect(state.notifiedPackageId).toBeNull();
  });

  it('reports package not present locally', async () => {
    await expect(rotate(tmpDir)).rejects.toThrow(
      /^ENOENT: no such file or directory, open '.*\/20160305-20160305\.zip'$/,
    );

    expect(state.notifiedPackageId).toBeNull();
  });

  it('reports broken read stream in zip', async () => {
    const validZip = Fs.readFileSync(Path.join(import.meta.dirname, 'fixtures', 'packages', 'valid.zip'));
    const corrupted = Buffer.from(validZip);

    const cdSig = Buffer.from([0x50, 0x4b, 0x01, 0x02]);
    const targetFilename = Buffer.from('PaketoInfo.xml');
    let searchOffset = 0;
    while (searchOffset < corrupted.length) {
      const idx = corrupted.indexOf(cdSig, searchOffset);
      if (idx === -1) break;
      const fnLen = corrupted.readUInt16LE(idx + 28);
      if (corrupted.subarray(idx + 46, idx + 46 + fnLen).equals(targetFilename)) {
        corrupted.writeUInt16LE(99, idx + 10);
        break;
      }
      searchOffset = idx + 1;
    }

    Fs.writeFileSync(Path.join(tmpDir, '20160305-20160305.zip'), corrupted);

    await expect(rotate(tmpDir)).rejects.toThrow('unsupported compression method');

    expect(state.notifiedPackageId).toBeNull();
  });

  it('reports local package zip no info', async () => {
    Fs.copyFileSync(
      Path.join(import.meta.dirname, 'fixtures', 'packages', 'no-info.zip'),
      Path.join(tmpDir, '20160305-20160305.zip'),
    );

    await expect(rotate(tmpDir)).rejects.toThrow(/^No PaketoInfo.xml in .*\/20160305-20160305\.zip$/);

    expect(state.notifiedPackageId).toBeNull();
  });
});
