'use strict';

const EtarClient = require('../index');
const FakeServer = require('./fixtures/fakeServer');

const Fs = require('fs');
const Lab = require('lab');
const Path = require('path');
const Tmp = require('tmp');

const { describe, it, expect, beforeEach, afterEach } = exports.lab = Lab.script();

describe('download', () => {

    let originalEnv;
    let originalConsoleLog;
    let tmpDir;

    beforeEach((done) => {

        originalEnv = Object.assign({}, process.env);

        Object.assign(process.env, {

            ETAR_USERNAME: 'valid-user',
            ETAR_PASSWORD: 'valid-password',
            ETAR_USERGUID: 'valid'
        });

        originalConsoleLog = console.log;
        console.log = () => {};

        tmpDir = Tmp.dirSync({ unsafeCleanup: true });

        done();
    });

    afterEach((done) => {

        process.env = originalEnv;
        console.log = originalConsoleLog;
        tmpDir.removeCallback();

        done();
    });

    it('downloads the package', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;

            EtarClient.download(tmpDir.name, (err, { packagePath, expectedPackageInfo }) => {

                expect(err).to.not.exist();

                expect(packagePath).to.endWith('20160305-20160305.zip');

                const downloaded = Fs.readFileSync(packagePath);
                const valid = Fs.readFileSync(Path.join(__dirname, 'fixtures', 'packages', 'valid.zip'));
                expect(downloaded.equals(valid)).to.equal(true);

                expect(expectedPackageInfo).to.equal({
                    packageId: 'FB8ABC12-66E4-4CD2-9500-70AA0EAA071A',
                    packageFilename: '20160305-20160305.zip',
                    packageApproxSize: 1048576,
                    documentsFrom: '2016-03-05',
                    documentsTo: '2016-03-05'
                });

                done();
            });
        });
    });

    it('reports broken package checks', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERGUID = 'no-id';

            EtarClient.download(tmpDir.name, (err) => {

                expect(err).to.be.an.error('Package ID not found');

                done();
            });
        });
    });

    it('reports no package yet', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERGUID = '423';

            EtarClient.download(tmpDir.name, (err) => {

                expect(err).to.be.an.error('No package available yet');

                done();
            });
        });
    });

    it('reports double download', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;

            const directory = tmpDir.name;
            EtarClient.download(directory, (err, { packagePath, expectedPackageInfo }) => {

                expect(err).to.not.exist();

                EtarClient.download(directory, (err) => {

                    expect(err).to.exist(`Package exists: ${packagePath}`);

                    done();
                });
            });
        });
    });

    it('reports network errors');

    it('reports missing env vars', (done) => {

        delete process.env.ETAR_USERNAME;

        EtarClient.download(tmpDir.name, (err) => {

            expect(err).to.be.an.error('Missing in process.env: ETAR_USERNAME');

            done();
        });
    });

    it('reports server errors', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERGUID = 'download-503';

            EtarClient.download(tmpDir.name, (err) => {

                expect(err).to.be.an.error('TAR API download response: 503 Temporarily Unavailable');

                done();
            });
        });
    });

    it('reports file writing errors');

});
