import { verifyAsic } from 'asic-verify';

export async function verify(pkg) {
  // @todo: verify signed with correct cert?
  // @todo: verify extracted files?
  await verifyAsic(pkg);
  console.log('ASiC-e checked.');
}
