'use strict';

const EtarClient = require('../index');

const Lab = require('lab');

const { describe, it, expect } = exports.lab = Lab.script();

describe('etar-client', () => {

    it('should exist', (done) => {

        expect(EtarClient).to.exist();
        done();
    });
});
