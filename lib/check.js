'use strict';

const Request = require('request');
const ValidateEnv = require('./internal/validateEnv');
const EtarHttp = require('./internal/etarHttp');
const GetPackageInfo = require('./internal/getPackageInfo');

const check = function (cb) {

    try {
        ValidateEnv();
    }
    catch (err) {
        return cb(err);
    }

    Request.get(EtarHttp.checkUrl(), { auth: EtarHttp.auth() }, (err, res) => {

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
