function baseUrl() {
  return `https://www.e-tar.lt/portal/DataExportAPI/${process.env.ETAR_USERGUID}`;
}

export function auth() {
  return {
    user: process.env.ETAR_USERNAME,
    pass: process.env.ETAR_PASSWORD,
    sendImmediately: false,
  };
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
