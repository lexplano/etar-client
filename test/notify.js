'use strict';

const EtarClient = require('../index');
const FakeServer = require('./fixtures/fakeServer');

const Lab = require('lab');

const { describe, it, expect, beforeEach, afterEach } = exports.lab = Lab.script();

describe('notify', () => {

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

    it('notifies server', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;


            const packageId = `package-id-${Date.now()}`;
            EtarClient.notify(packageId, (err) => {

                expect(err).to.not.exist();

                expect(server.app.requestedPackageId).to.equal(packageId);

                done();
            });
        });
    });

    it('reports network errors', (done) => {

        process.env.ETAR_HOST = 'http://0.0.0.0:666';

        EtarClient.notify('package-id', (err) => {

            expect(err).to.be.an.error('connect ECONNREFUSED 0.0.0.0:666');

            done();
        });
    });

    it('reports missing env vars', (done) => {

        delete process.env.ETAR_USERNAME;

        EtarClient.notify('package-id', (err) => {

            expect(err).to.be.an.error('Missing in process.env: ETAR_USERNAME');

            done();
        });
    });

    it('reports auth errors', (done, onCleanup) => {

        FakeServer.start(onCleanup, {}, (err, server) => {

            expect(err).to.not.exist();

            process.env.ETAR_HOST = server.select().info.uri;
            process.env.ETAR_USERNAME = 'invalid';

            EtarClient.notify('package-id', (err) => {

                expect(err).to.be.an.error('TAR API notify response: 401 Unauthorized');

                done();
            });
        });
    });
});
