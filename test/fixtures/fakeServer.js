'use strict';

const Fs = require('fs');
const Hapi = require('hapi');
const HapiAuthBasic = require('hapi-auth-basic');
const Path = require('path');


const internals = {
    service: {}
};


internals.service.register = (server, options, next) => {

    const plugins = [
        HapiAuthBasic
    ];

    server.register(plugins, (err) => {

        if (err) {
            return next(err);
        }

        server.auth.strategy('simple', 'basic', {
            validateFunc: (req, u, p, cb) => {

                cb(null, u === 'valid-user' && p === 'valid-password', { id: 'valid-user' });
            }
        });

        server.route({
            method: 'GET',
            path: '/portal/DataExportAPI/{userguid}/currentDataPacketInfo',
            config: {
                auth: 'simple',
                handler: (request, reply) => {

                    switch (request.params.userguid) {

                        case '423':
                            reply('New package not ready yet').code(423);
                            break;

                        case '503':
                            reply('Maintenance').code(503).message('Temporarily Unavailable');
                            break;

                        case 'download-503':
                        case 'notify-503':
                            reply(Fs.createReadStream(Path.join(__dirname, 'packageInfo', 'valid.xml')));
                            break;

                        default:
                            reply(Fs.createReadStream(Path.join(__dirname, 'packageInfo', `${request.params.userguid}.xml`)));
                    }

                }
            }
        });

        server.route({
            method: 'GET',
            path: '/portal/DataExportAPI/{userguid}/currentDataPacket',
            config: {
                auth: 'simple',
                handler: (request, reply) => {

                    switch (request.params.userguid) {

                        case 'download-503':
                            reply('Maintenance').code(503).message('Temporarily Unavailable');
                            break;

                        default:
                            reply(Fs.createReadStream(Path.join(__dirname, 'packages', `${request.params.userguid}.zip`)));
                    }

                }
            }
        });

        server.route({
            method: 'POST',
            path: '/portal/DataExportAPI/{userguid}/packetReceptionConfirmation',
            config: {
                auth: 'simple',
                handler: (request, reply) => {

                    if (!request.payload.id) {
                        throw new Error('Invalid notify request');
                    }

                    server.app.notifiedPackageId = request.payload.id;

                    switch (request.params.userguid) {

                        case '423':
                        case 'notify-503':
                            reply('Maintenance').code(503).message('Temporarily Unavailable');
                            break;

                        default:
                            reply({ success: true });
                    }
                }
            }
        });

        next();
    });
};

internals.service.register.attributes = {
    name: 'fake-service'
};


module.exports.start = (onCleanup, options, callback) => {

    const server = new Hapi.Server();

    server.connection();

    server.register(internals.service, (err) => {

        if (err) {
            return callback(err);
        }

        server.start((err) => {

            if (err) {
                return server.stop((stopErr) => {

                    if (stopErr) {
                        console.error(stopErr);
                    }

                    callback(err);
                });
            }

            onCleanup((done) => {

                return server.stop({ timeout: 60000 }, done);
            });


            setTimeout(() => callback(null, server));
        });
    });
};
