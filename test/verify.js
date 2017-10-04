'use strict';

const EtarClient = require('../index');

const Lab = require('lab');
const Path = require('path');

const { describe, it, expect, beforeEach, afterEach } = exports.lab = Lab.script();

describe('notify', () => {

    let originalConsoleLog;

    beforeEach((done) => {

        originalConsoleLog = console.log;
        console.log = () => {};

        done();
    });

    afterEach((done) => {

        console.log = originalConsoleLog;

        done();
    });

    it('reports no error on valid file', (done) => {

        EtarClient.verify(Path.join(__dirname, 'fixtures', 'packages', 'valid.zip'), (err) => {

            expect(err).not.to.exist();
            done();
        });
    });

    it('reports error on invalid file', (done) => {

        EtarClient.verify(Path.join(__dirname, 'fixtures', 'packages', 'no-sig.zip'), (err) => {

            expect(err).to.be.an.error('Could not find exactly one entry for META-INF/signatures.xml');
            done();
        });
    });
});
