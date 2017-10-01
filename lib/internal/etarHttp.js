'use strict';

const etarHost = () => {

    /* $lab:coverage:off$ */
    if (process.env.NODE_ENV === 'test') {
        return process.env.ETAR_HOST;
    }

    return 'https://www.e-tar.lt';
    /* $lab:coverage:on$ */
};

const baseUrl = () => {

    return `${etarHost()}/portal/DataExportAPI/${process.env.ETAR_USERGUID}`;
};

module.exports.auth = () => {

    return {
        'user': process.env.ETAR_USERNAME,
        'pass': process.env.ETAR_PASSWORD,
        'sendImmediately': false
    };
};

module.exports.checkUrl = () => {

    return `${baseUrl()}/currentDataPacketInfo`;
};
