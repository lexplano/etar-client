'use strict';

let request = require('request'),
    validateEnv = require('./internal/validateEnv'),
    getPackageInfo = require('./internal/getPackageInfo');

function getCheckUrl(ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {
    return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/currentDataPacketInfo`;
}

function check(cb) {

    try {
        validateEnv();
    }
    catch (err) {
        return cb(err);
    }

    const url = getCheckUrl(process.env.ETAR_USERNAME, process.env.ETAR_PASSWORD, process.env.ETAR_USERGUID);
    request(url, (err, res) => {

        if (err) {
            return cb(err);
        }

        if (res.statusCode === 423) {
            return cb(null, null);
        }

        if (res.statusCode !== 200) {
            return cb(new Error(`TAR API check response: ${res.statusCode} ${res.statusMessage}`));
        }

        getPackageInfo(res.body, cb);
    });

}

module.exports = check;
