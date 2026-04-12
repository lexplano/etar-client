function baseUrl() {
  return `https://www.e-tar.lt/portal/DataExportAPI/${process.env.ETAR_USERGUID}`;
}

export function authHeader() {
  const credentials = Buffer.from(`${process.env.ETAR_USERNAME}:${process.env.ETAR_PASSWORD}`).toString('base64');
  return { Authorization: `Basic ${credentials}` };
}

export function checkUrl() {
  return `${baseUrl()}/currentDataPacketInfo`;
}

export function downloadUrl() {
  return `${baseUrl()}/currentDataPacket`;
}

export function notifyUrl() {
  return `${baseUrl()}/packetReceptionConfirmation`;
}
