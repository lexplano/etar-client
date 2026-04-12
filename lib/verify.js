import { promisify } from 'node:util';
import AsicVerify from 'asic-verify';

export async function verify(pkg) {
  // @todo: verify signed with correct cert?
  // @todo: verify extracted files?
  await promisify(AsicVerify)(pkg);
  console.log('ASiC-e checked.');
}
