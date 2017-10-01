'use strict';

const Request = require('request');
const ValidateEnv = require('./internal/validateEnv');
const GetPackageInfo = require('./internal/getPackageInfo');

const getCheckUrl = function (ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {

    return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/currentDataPacketInfo`;
};

const check = function (cb) {

    try {
        ValidateEnv();
    }
    catch (err) {
        return cb(err);
    }

    const url = getCheckUrl(process.env.ETAR_USERNAME, process.env.ETAR_PASSWORD, process.env.ETAR_USERGUID);
    Request(url, (err, res) => {

        if (err) {
            return cb(err);
        }

        if (res.statusCode === 423) {
            return cb(null, null);
        }

        if (res.statusCode !== 200) {
            return cb(new Error(`TAR API check response: ${res.statusCode} ${res.statusMessage}`));
        }

        GetPackageInfo(res.body, cb);
    });
};

module.exports = check;
