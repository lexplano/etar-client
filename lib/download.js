'use strict';

const Check = require('./check');
const EtarHttp = require('./internal/etarHttp');
const Request = require('request');
const WithProgress = require('request-progress');
const Fs = require('fs');
const Path = require('path');
const ValidateEnv = require('./internal/validateEnv');

const download = function (storagePath, cb) {

    try {
        ValidateEnv();
    }
    catch (err) {
        return cb(err);
    }

    Check((err, expectedPackageInfo) => {

        if (err) {
            return cb(err);
        }

        if (!expectedPackageInfo) {
            return cb(new Error('No package available yet'));
        }

        // @todo: mkdirp?
        const packagePath = Path.join(storagePath, expectedPackageInfo.packageFilename);

        if (Fs.existsSync(packagePath)) {
            return cb(new Error(`Package exists: ${packagePath}`));
        }

        const outputStream = Fs.createWriteStream(packagePath);

        const request = WithProgress(Request.get(EtarHttp.downloadUrl(), { auth: EtarHttp.auth() }), { throttle: 1000, delay: 1000 });

        request
            .on('response', (res) => {

                if (res.statusCode !== 200) {
                    cb(new Error(`TAR API download response: ${res.statusCode} ${res.statusMessage}`));
                    return;
                }

                request
                    .on('error', (err) => {

                        cb(err);
                    })
                    .pipe(outputStream)
                    .on('error', (err) => {

                        cb(err);
                    })
                    .on('close', () => {

                        cb(null, {
                            packagePath,
                            expectedPackageInfo
                        });
                    });

            })
            .on('progress', (progress) => {

                // @todo: any way to test this?
                const receivedMb = Math.round(progress.size.transferred / 1024 / 1024);
                const receivedPercent = Math.round(100 * progress.size.transferred / expectedPackageInfo.packageApproxSize);
                console.log(`Received ~${receivedPercent}% (${receivedMb}Mb)`);
            });

    });
};

module.exports = download;
