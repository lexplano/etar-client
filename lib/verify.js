'use strict';

const AsicVerify = require('asic-verify');

const verify = function (pkg, cb) {

    // @todo: verify signed with correct cert?
    // @todo: verify extracted files?
    AsicVerify(pkg, (err) => {

        console.log('ASiC-e checked.');
        cb(err);
    });
};

module.exports = verify;
