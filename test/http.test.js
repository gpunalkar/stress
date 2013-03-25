"use strict";
var assert = require('assert'),
    http = require('http'),
    config = require('../lib/config'),
    HttpServer = require('../lib/http').HttpServer,
    originalConfig = config.settings.enableServer;

describe('http', function(){
    it('example: add a new route', function(complete) {
        config.enableServer(false);
        config.apply();
        var done = false,
            server = new HttpServer();

        server.once('start', function(){
            server.addRoute('^/route', function(url, req, res) {

                config.enableServer(originalConfig);
                assert.ok(true, 'Never got request to /route');
                res.end();
                complete();
            });

            var client = http.createClient(9020, '127.0.0.1'),
                req = client.request('GET', '/route/item');
            req.end();
        });

        server.start(9020);

        setTimeout(function() {
            server.stop();
            config.enableServer(originalConfig);
            assert.fail();
            complete();
        }, 2000);
    });

    it('test file server finds package.json', function(complete) {
        var server = new HttpServer();
        server.once('start', function(){

            var client = http.createClient(9021, '127.0.0.1'),
                req = client.request('GET', '/package.json');

            req.end();

            req.on('response', function(res) {
                assert.equal(res.statusCode, 200);
                res.on('data', function(chunk) {
                    config.enableServer(originalConfig);
                    assert.ok(true, 'Never got response data from /package.json');
                    complete();
                });
            });
        });

        server.start(9021);

        setTimeout(function() {
            config.enableServer(originalConfig);
            server.stop();
            assert.fail();
            complete();
        }, 2000);
    });
});
