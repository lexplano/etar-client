'use strict';

let yauzl = require('yauzl'),
    concat = require('concat-stream'),
    getPackageInfo = require('./getPackageInfo');

function getPackageInfoFromZip(pkg, cb) {
    yauzl.open(pkg, (err, zipfile) => {
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
                        .pipe(concat((data) => {
                            getPackageInfo(data.toString(), (err, pkgInfo) => {
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
}

module.exports = getPackageInfoFromZip;
