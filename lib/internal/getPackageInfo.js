'use strict';

const Xml2js = require('xml2js');

const stripDate = function (dateString) {

    if (!dateString.match(/^\d\d\d\d-\d\d\-\d\d$/)) {
        console.warn('Bad date string', dateString);
        return dateString;
    }

    return dateString.replace(/-/g, '');
};

const getPackageInfo = function (xmlString, cb) {

    Xml2js.parseString(xmlString, (err, xmlData) => {

        if (err) {
            return cb(err);
        }

        if (!xmlData.paketoInfo.ID || xmlData.paketoInfo.ID.length !== 1) {
            console.log('Package XML data', xmlData);
            return cb(new Error('Package ID not found'));
        }

        if (!xmlData.paketoInfo['TeisėsAktaiNuo'] || xmlData.paketoInfo['TeisėsAktaiNuo'].length !== 1) {
            console.log('Package XML data', xmlData);
            return cb(new Error('Start date not found'));
        }

        if (!xmlData.paketoInfo['TeisėsAktaiIki'] || xmlData.paketoInfo['TeisėsAktaiIki'].length !== 1) {
            console.log('Package XML data', xmlData);
            return cb(new Error('End date not found'));
        }

        if (!xmlData.paketoInfo.PaketoDydisMB || xmlData.paketoInfo.PaketoDydisMB.length !== 1) {
            console.log('Package XML data', xmlData);
            return cb(new Error('Package size not found'));
        }

        const packageId = xmlData.paketoInfo.ID[0];
        const documentsFrom = xmlData.paketoInfo['TeisėsAktaiNuo'][0];
        const documentsTo = xmlData.paketoInfo['TeisėsAktaiIki'][0];
        const packageFilename = `${stripDate(documentsFrom)}-${stripDate(documentsTo)}.zip`;
        const packageApproxSize = xmlData.paketoInfo.PaketoDydisMB[0] * 1024 * 1024;

        cb(null, { packageId, packageFilename, packageApproxSize, documentsFrom, documentsTo });
    });
};

module.exports = getPackageInfo;
