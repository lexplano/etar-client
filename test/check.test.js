'use strict';

const EtarClient = require('../index');
const FakeServer = require('./fixtures/fakeServer');

const Lab = require('lab');

const { describe, it, expect, beforeEach, afterEach } = exports.lab = Lab.script();

describe('check', () => {

    let envCopy;
    beforeEach((done) => {

        envCopy = Object.assign({}, process.env);

        Object.assign(process.env, {

            ETAR_USERNAME: 'valid-user',
            ETAR_PASSWORD: 'valid-password',
            ETAR_USERGUID: 'valid-userguid'
        });

        done();
    });

    afterEach((done) => {

        process.env = envCopy;
        done();
    });

    it('returns package info JSON', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;

            EtarClient.check((err, packageInfo) => {

                expect(err).to.not.exist();

                expect(packageInfo).to.equal({
                    packageId: '187269AF-4633-482D-8E50-F0AA511419B9',
                    packageFilename: '20170929-20170929.zip',
                    packageApproxSize: 34603008,
                    documentsFrom: '2017-09-29',
                    documentsTo: '2017-09-29'
                });

                done();
            });
        });
    });

    it('reports network errors', (done) => {

        process.env.ETAR_HOST = 'http://0.0.0.0:666';

        EtarClient.check((err, packageInfo) => {

            expect(err).to.be.an.error('connect ECONNREFUSED 0.0.0.0:666');

            done();
        });
    });

    it('reports missing env vars', (done) => {

        delete process.env.ETAR_USERNAME;

        EtarClient.check((err, packageInfo) => {

            expect(err).to.be.an.error('Missing in process.env: ETAR_USERNAME');

            done();
        });
    });

    it('returns null when new package not ready yet', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERGUID = '423';

            EtarClient.check((err, packageInfo) => {

                expect(err).to.not.exist();
                expect(packageInfo).to.equal(null);

                done();
            });
        });
    });

    it('reports server errors', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERGUID = '503';

            EtarClient.check((err, packageInfo) => {

                expect(err).to.be.an.error('TAR API check response: 503 Temporarily Unavailable');

                done();
            });
        });
    });
});
