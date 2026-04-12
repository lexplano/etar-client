import Xml2js from 'xml2js';

const VALID_DATE_REGEXP = /^\d\d\d\d-\d\d-\d\d$/;

function stripDashes(dateString) {
  return dateString.replace(/-/g, '');
}

export async function getPackageInfo(xmlString) {
  const xmlData = await Xml2js.parseStringPromise(xmlString);

  if (!xmlData.paketoInfo.ID || xmlData.paketoInfo.ID.length !== 1) {
    console.log('Package XML data', xmlData);
    throw new Error('Package ID not found');
  }

  if (!xmlData.paketoInfo['TeisėsAktaiNuo'] || xmlData.paketoInfo['TeisėsAktaiNuo'].length !== 1) {
    console.log('Package XML data', xmlData);
    throw new Error('Start date not found');
  }

  if (!xmlData.paketoInfo['TeisėsAktaiIki'] || xmlData.paketoInfo['TeisėsAktaiIki'].length !== 1) {
    console.log('Package XML data', xmlData);
    throw new Error('End date not found');
  }

  if (!xmlData.paketoInfo.PaketoDydisMB || xmlData.paketoInfo.PaketoDydisMB.length !== 1) {
    console.log('Package XML data', xmlData);
    throw new Error('Package size not found');
  }

  const packageId = xmlData.paketoInfo.ID[0];
  const documentsFrom = xmlData.paketoInfo['TeisėsAktaiNuo'][0];
  const documentsTo = xmlData.paketoInfo['TeisėsAktaiIki'][0];
  const packageFilename = `${stripDashes(documentsFrom)}-${stripDashes(documentsTo)}.zip`;
  const packageApproxSize = xmlData.paketoInfo.PaketoDydisMB[0] * 1024 * 1024;

  if (!documentsFrom.match(VALID_DATE_REGEXP)) {
    console.log('Package XML data', xmlData);
    throw new Error('Invalid start date');
  }

  if (!documentsTo.match(VALID_DATE_REGEXP)) {
    console.log('Package XML data', xmlData);
    throw new Error('Invalid end date');
  }

  return { packageId, packageFilename, packageApproxSize, documentsFrom, documentsTo };
}
