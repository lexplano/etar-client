'use strict';

const Request = require('request');
const ValidateEnv = require('./internal/validateEnv');

const getNotifyUrl = function (ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {

    return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/packetReceptionConfirmation`;
};

const notify = function (packageId, cb) {

    try {
        ValidateEnv();
    }
    catch (err) {
        return cb(err);
    }

    const url = getNotifyUrl(process.env.ETAR_USERNAME, process.env.ETAR_PASSWORD, process.env.ETAR_USERGUID);
    Request.post(url, { form: { id: packageId } }, (err, res) => {

        if (err) {
            return cb(err);
        }

        if (res.statusCode !== 200) {
            return cb(new Error(`TAR API notify response: ${res.statusCode} ${res.statusMessage}`));
        }

        cb(null);
    });
};

module.exports = notify;
