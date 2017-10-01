'use strict';

let request = require('request'),
    validateEnv = require('./internal/validateEnv');

function getNotifyUrl(ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {
    return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/packetReceptionConfirmation`;
}

function notify(packageId, cb) {

    try {
        validateEnv();
    }
    catch (err) {
        return cb(err);
    }

    const url = getNotifyUrl(process.env.ETAR_USERNAME, process.env.ETAR_PASSWORD, process.env.ETAR_USERGUID);
    request.post(url, { form: { id: packageId } }, (err, res) => {

        if (err) {
            return cb(err);
        }

        if (res.statusCode !== 200) {
            return cb(new Error(`TAR API notify response: ${res.statusCode} ${res.statusMessage}`));
        }

        cb(null);
    });

}

module.exports = notify;
