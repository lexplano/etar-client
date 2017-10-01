'use strict';

const Yauzl = require('yauzl');
const Concat = require('concat-stream');
const GetPackageInfo = require('./getPackageInfo');

const getPackageInfoFromZip = function (pkg, cb) {

    Yauzl.open(pkg, (err, zipfile) => {

        if (err) {
            return cb(err);
        }


        let packageInfoFound = false;
        zipfile
            .on('entry', (entry) => {

                if (entry.fileName !== 'PaketoInfo.xml') {
                    return;
                }

                zipfile.openReadStream(entry, (err, readStream) => {

                    if (err) {
                        return cb(err);
                    }

                    packageInfoFound = true;
                    readStream
                        .on('error', () => {

                            cb(err);
                        })
                        .pipe(Concat((data) => {

                            GetPackageInfo(data.toString(), (err, pkgInfo) => {

                                cb(err, pkgInfo);
                            });
                        }));
                });
            })
            .on('error', () => {

                cb(err);
            })
            .on('end', () => {

                if (!packageInfoFound) {
                    cb(new Error(`No PaketoInfo.xml in ${pkg}`));
                }
            });
    });
};

module.exports = getPackageInfoFromZip;
