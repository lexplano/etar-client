'use strict';

const Path = require('path');
const Waterfall = require('async-waterfall');
const Check = require('./check');
const Verify = require('./verify');
const GetPackageInfoFromZip = require('./internal/getPackageInfoFromZip');
const Notify = require('./notify');

module.exports = function (storagePath, cb) {

    Check((err, pkgInfo) => {

        if (err) {
            cb(err);
            return;
        }

        if (!pkgInfo) {
            cb(null, null);
            return;
        }

        const pkgPath = Path.join(storagePath, pkgInfo.packageFilename);

        Waterfall([
            (done) => {

                GetPackageInfoFromZip(pkgPath, done);
            },
            (infoFromZip, done) => {

                done(pkgInfo.packageId === infoFromZip.packageId ?
                    null :
                    new Error(`Package ID mismatch. Server: ${pkgInfo.packageId}, local: ${infoFromZip.packageId}`));
            },
            (done) => {

                Verify(pkgPath, done);
            },
            (done) => {

                Notify(pkgInfo.packageId, done);
            }
        ], (err) => {

            cb(err, pkgInfo);
        });
    });

};
