'use strict';

const Request = require('request');
const ValidateEnv = require('./internal/validateEnv');
const EtarHttp = require('./internal/etarHttp');

const notify = function (packageId, cb) {

    try {
        ValidateEnv();
    }
    catch (err) {
        return cb(err);
    }

    Request.post(EtarHttp.notifyUrl(), { form: { id: packageId }, auth: EtarHttp.auth() }, (err, res) => {

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
