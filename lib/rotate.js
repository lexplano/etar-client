'use strict';

let path = require('path'),
    waterfall = require('async-waterfall'),
    check = require('./check'),
    verify = require('./verify'),
    getPackageInfoFromZip = require('./internal/getPackageInfoFromZip'),
    notify = require('./notify');

module.exports = function (storagePath, cb) {

    check((err, pkgInfo) => {
        if (err) {
            cb(err);
            return;
        }

        if (!pkgInfo) {
            cb(null, null);
            return;
        }

        const pkgPath = path.join(storagePath, pkgInfo.packageFilename);

        waterfall([
            function (done) {
                getPackageInfoFromZip(pkgPath, done);
            },
            function (infoFromZip, done) {
                done(pkgInfo.packageId === infoFromZip.packageId ?
                    null :
                    new Error(`Package ID mismatch. Server: ${pkgInfo.packageId}, local: ${infoFromZip.packageId}`));
            },
            function (done) {
                verify(pkgPath, done);
            },
            function (done) {
                notify(pkgInfo.packageId, done);
            }
        ], (err) => {
            cb(err, pkgInfo);
        });
    });

};
