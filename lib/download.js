'use strict';

const Check = require('./check');
const Request = require('request');
const WithProgress = require('request-progress');
const Fs = require('fs');
const Path = require('path');
const ValidateEnv = require('./internal/validateEnv');

const getDownloadUrl = function (ETAR_USERNAME, ETAR_PASSWORD, ETAR_USERGUID) {

    return `https://${ETAR_USERNAME}:${ETAR_PASSWORD}@www.e-tar.lt/portal/DataExportAPI/${ETAR_USERGUID}/currentDataPacket`;
};

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

        const packagePath = Path.join(storagePath, expectedPackageInfo.packageFilename);

        const url = getDownloadUrl(process.env.ETAR_USERNAME, process.env.ETAR_PASSWORD, process.env.ETAR_USERGUID);

        if (Fs.existsSync(packagePath)) {
            return cb(new Error(`Package exists: ${packagePath}`));
        }

        const outputStream = Fs.createWriteStream(packagePath);

        WithProgress(Request(url), { throttle: 1000, delay: 1000 })
            .on('response', (res) => {

                if (res.statusCode !== 200) {
                    throw new Error(`TAR API download response: ${res.statusCode} ${res.statusMessage}`);
                }

                // @todo: don't overwrite?
                // @todo: mkdirp
            })
            .on('progress', (progress) => {

                const receivedMb = Math.round(progress.received / 1024 / 1024);
                const receivedPercent = Math.round(100 * progress.received / expectedPackageInfo.packageApproxSize);
                console.log(`Received ~${receivedPercent}% (${receivedMb}Mb)`);
            })
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

    });
};

module.exports = download;
