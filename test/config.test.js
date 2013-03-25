"use strict";
var mocha = require('mocha'),
    assert = require('assert'),
    config = require('../lib/config'),
    path = require('path'),
    baseOutputDir = path.join(process.env.HOME, '.config/stress');

beforeEach(function() {
    config.reset();
});

describe('Configuration', function() {
    describe('default settings', function() {
        it('should not surprise us with unexpected defaults...', function(done) {
            // If these values change, docs MUST be updated
            assert.equal(80, config.settings.port);
            assert.equal(false, config.settings.quiet);
            assert.equal(false, config.settings.lazy);
            assert.equal(true, config.settings.enableServer);
            assert.equal(2000, config.settings.monitorInterval);
            assert.equal(2000, config.settings.refreshInterval);
            assert.equal(true, config.settings.logsEnabled);
            assert.equal(3000, config.settings.slaveUpdateInterval);
            assert.equal(baseOutputDir, config.settings.baseDirectory);

            done();
        });
    });

    describe('Changes should emit for...', function() {
        it('port', function(done) {
            var original = config.settings.port;
            config.once('change', function(setting, o, n) {
                assert.equal('port', setting);
                assert.equal(original, o);
                assert.equal(8080, n);
                done();
            });

            config.port(8080);
            config.port(original); // back to default
        });

        it('quiet', function(done) {
            var original = config.settings.quiet;
            config.once('change', function(setting, o, n) {
                assert.equal('quiet', setting);
                assert.equal(original, o);
                assert.equal(!original, n);
                done();
            });

            config.quiet(!original);
            config.quiet(original); // back to default
        });

        it('lazy', function(done) {
            var original = config.settings.lazy;
            config.once('change', function(setting, o, n) {
                assert.equal('lazy', setting);
                assert.equal(original, o);
                assert.equal(!original, n);
                done();
            });

            config.lazy(!original);
            config.lazy(original); // back to default
        });

        it('enableServer', function(done) {
            var original = config.settings.enableServer;
            config.once('change', function(setting, o, n) {
                assert.equal('enableServer', setting);
                assert.equal(original, o);
                assert.equal(!original, n);
                done();
            });

            config.enableServer(!original);
            config.enableServer(original); // back to default
        });

        it('monitorInterval', function(done) {
            var original = config.settings.monitorInterval;
            config.once('change', function(setting, o, n) {
                assert.equal('monitorInterval', setting);
                assert.equal(original, o);
                assert.equal(3000, n);
                done();
            });

            config.monitorInterval(3000);
            config.monitorInterval(original); // back to default
        });

        it('refreshInterval', function(done) {
            var original = config.settings.refreshInterval;
            config.once('change', function(setting, o, n) {
                assert.equal('refreshInterval', setting);
                assert.equal(original, o);
                assert.equal(5000, n);
                done();
            });

            config.refreshInterval(5000);
            config.refreshInterval(original); // back to default
        });

        it('logsEnabled', function(done) {
            var original = config.settings.logsEnabled;
            config.once('change', function(setting, o, n) {
                assert.equal('logsEnabled', setting);
                assert.equal(original, o);
                assert.equal(!original, n);
                done();
            });

            config.logsEnabled(!original);
            config.logsEnabled(original); // back to default
        });

        it('slaveUpdateInterval', function(done) {
            var original = config.settings.slaveUpdateInterval;
            config.once('change', function(setting, o, n) {
                assert.equal('slaveUpdateInterval', setting);
                assert.equal(original, o);
                assert.equal(9898, n);
                done();
            });

            config.slaveUpdateInterval(9898);
            config.slaveUpdateInterval(original); // back to default
        });

        it('baseDirectory', function(done) {
            var original = config.settings.baseDirectory;
            config.once('change', function(setting, o, n) {
                assert.equal('baseDirectory', setting);
                assert.equal(original, o);
                assert.equal('~/something', n);
                done();
            });

            // NOTE: Path expansion isn't currently supported or validated
            config.baseDirectory('~/something');
            config.baseDirectory(original); // back to default
        });
    });

    describe('Changed values should coerce to defaults when invalid for...', function() {

        it('port', function(done) {
            var original = config.settings.port;
            config.once('change', function(setting, o, n) {
                assert.equal('port', setting);
                assert.equal(original, o);
                assert.equal(original, n);
                done();
            });

            config.port(2);
            config.port(original); // back to default
        });

        it('quiet', function(done) {
            // config.settings.quiet defaults to false
            // but, config.quiet() means to set to true.
            // This is what happens with config.quiet(invalidValue)
            var original = config.settings.quiet;
            config.once('change', function(setting, o, n) {
                assert.equal('quiet', setting);
                assert.equal(original, o);
                assert.equal(!original, n);
                done();
            });

            config.quiet(555);
            config.quiet(original); // back to default
        });

        it('lazy', function(done) {
            var original = config.settings.lazy;
            config.once('change', function(setting, o, n) {
                assert.equal('lazy', setting);
                assert.equal(original, o);
                assert.equal(original, n);
                done();
            });

            config.lazy(-15);
            config.lazy(original); // back to default
        });

        it('enableServer', function(done) {
            var original = config.settings.enableServer;
            config.once('change', function(setting, o, n) {
                assert.equal('enableServer', setting);
                assert.equal(original, o);
                assert.equal(true, n);
                done();
            });

            config.enableServer('asdf');
            config.enableServer(original); // back to default
        });

        it('monitorInterval', function(done) {
            var original = config.settings.monitorInterval;
            config.once('change', function(setting, o, n) {
                assert.equal('monitorInterval', setting);
                assert.equal(original, o);
                assert.equal(250, n);
                done();
            });

            config.monitorInterval('cookies');
            config.monitorInterval(original); // back to default
        });

        it('refreshInterval', function(done) {
            var original = config.settings.refreshInterval;
            config.once('change', function(setting, o, n) {
                assert.equal('refreshInterval', setting);
                assert.equal(original, o);
                assert.equal(250, n);
                done();
            });

            config.refreshInterval({});
            config.refreshInterval(original); // back to default
        });

        it('logsEnabled', function(done) {
            var original = config.settings.logsEnabled;
            config.once('change', function(setting, o, n) {
                assert.equal('logsEnabled', setting);
                assert.equal(original, o);
                assert.equal(!original, n);
                done();
            });

            config.logsEnabled(!original);
            config.logsEnabled(original); // back to default
        });

        it('slaveUpdateInterval', function(done) {
            var original = config.settings.slaveUpdateInterval;
            config.once('change', function(setting, o, n) {
                assert.equal('slaveUpdateInterval', setting);
                assert.equal(original, o);
                assert.equal(9898, n);
                done();
            });

            config.slaveUpdateInterval(9898);
            config.slaveUpdateInterval(original); // back to default
        });

        it('baseDirectory', function(done) {
            var original = config.settings.baseDirectory;
            config.once('change', function(setting, o, n) {
                assert.equal('baseDirectory', setting);
                assert.equal(original, o);
                assert.equal('~/something', n);
                done();
            });

            // NOTE: Path expansion isn't currently supported or validated
            config.baseDirectory('~/something');
            config.baseDirectory(original); // back to default
        });
    });
});