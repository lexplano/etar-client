function etarHost() {
  if (process.env.NODE_ENV === 'test') {
    return process.env.ETAR_HOST;
  }

  return 'https://www.e-tar.lt';
}

function baseUrl() {
  return `${etarHost()}/portal/DataExportAPI/${process.env.ETAR_USERGUID}`;
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
