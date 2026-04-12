import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Path from 'node:path';
import { verify } from '..';

describe('verify', () => {
  let originalConsoleLog;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = () => {};
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('reports no error on valid file', async () => {
    await expect(verify(Path.join(import.meta.dirname, 'fixtures', 'packages', 'valid.zip'))).resolves.toBeUndefined();
  });

  it('reports error on invalid file', async () => {
    await expect(verify(Path.join(import.meta.dirname, 'fixtures', 'packages', 'no-sig.zip'))).rejects.toThrow(
      'Could not find exactly one entry for META-INF/signatures.xml',
    );
  });
});
