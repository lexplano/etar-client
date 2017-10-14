'use strict';

const EtarClient = require('../index');
const FakeServer = require('./fixtures/fakeServer');

const Fs = require('fs');
const Lab = require('lab');
const Path = require('path');
const Tmp = require('tmp');

const { describe, it, expect, beforeEach, afterEach } = exports.lab = Lab.script();

describe('rotate', () => {

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

    it('notifies server', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;

            Fs.copyFileSync(Path.join(__dirname, 'fixtures', 'packages', 'valid.zip'), Path.join(tmpDir.name, '20160305-20160305.zip'));

            EtarClient.rotate(tmpDir.name, (err, pkgInfo) => {

                expect(server.app.notifiedPackageId).to.equal('FB8ABC12-66E4-4CD2-9500-70AA0EAA071A');

                expect(err).to.not.exist();

                expect(pkgInfo).to.equal({
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

            EtarClient.rotate(tmpDir.name, (err) => {

                expect(err).to.be.an.error('Package ID not found');

                done();
            });
        });
    });

    it('does not notify when no package', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERGUID = '423';

            EtarClient.rotate(tmpDir.name, (err, pkgInfo) => {

                expect(server.app.notifiedPackageId).not.to.exist();

                expect(err).not.to.exist();
                expect(pkgInfo).to.equal(null);

                done();
            });
        });
    });

    it('reports invalid archive', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;

            Fs.copyFileSync(Path.join(__dirname, 'fixtures', 'packages', 'no-sig.zip'), Path.join(tmpDir.name, '20160305-20160305.zip'));

            EtarClient.rotate(tmpDir.name, (err, pkgInfo) => {

                expect(server.app.notifiedPackageId).not.to.exist();

                expect(err).to.be.an.error('Could not find exactly one entry for META-INF/signatures.xml');

                done();
            });
        });
    });

    it('reports package ID mismatch', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERGUID = 'valid2';

            Fs.copyFileSync(Path.join(__dirname, 'fixtures', 'packages', 'valid.zip'), Path.join(tmpDir.name, '20160305-20160305.zip'));

            EtarClient.rotate(tmpDir.name, (err, pkgInfo) => {

                expect(server.app.notifiedPackageId).not.to.exist();

                expect(err).to.be.an.error('Package ID mismatch. Server: 00000000-66E4-4CD2-9500-70AA0EAA071A, local: FB8ABC12-66E4-4CD2-9500-70AA0EAA071A');

                done();
            });
        });
    });

    it('reports package not present locally', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;

            EtarClient.rotate(tmpDir.name, (err, pkgInfo) => {

                expect(server.app.notifiedPackageId).not.to.exist();

                expect(err).to.be.an.error(/^ENOENT: no such file or directory, open '.*\/20160305-20160305.zip'$/);

                done();
            });
        });
    });

    it('reports local package zip no info', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;

            Fs.copyFileSync(Path.join(__dirname, 'fixtures', 'packages', 'no-info.zip'), Path.join(tmpDir.name, '20160305-20160305.zip'));

            EtarClient.rotate(tmpDir.name, (err, pkgInfo) => {

                expect(server.app.notifiedPackageId).not.to.exist();

                expect(err).to.be.an.error(/^No PaketoInfo.xml in .*\/20160305-20160305.zip$/);

                done();
            });
        });
    });

});
