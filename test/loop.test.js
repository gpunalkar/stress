var assert = require('assert'),
    loop = require('../lib/loop'),
    Loop = loop.Loop,
    MultiLoop = loop.MultiLoop;

describe('loop', function() {
    "use strict";

    it('example: a basic rps loop with set duration', function(done) {
        var i = 0, start = new Date(), lasttime = start, duration,
            l = new Loop({
                fun     : function(finished) {
                    var now = new Date();

                    // expect this run to be no greater than 200ms after last run, accounting for 15ms clock speed inadequacy
                    assert.ok(Math.abs(now - lasttime) <= 215, (now - lasttime).toString());
                    lasttime = now;

                    i++;
                    finished();
                },
                rps     : 5, // times per second (every 200ms)
                duration: 1 // second
            });

        l.on('end', function() {
            duration = new Date() - start;
            assert.equal(i, 5, 'loop executed incorrect number of times: ' + i);
            assert.ok(!l.running, 'loop still flagged as running');

            // duration should be within .075s
            assert.ok(Math.abs(duration - 1000) <= 75, '1000 == ' + duration);

            done();
        });

        l.start();
    });

    it('example: use profiles to vary execution rate and concurrency', function(done) {
        var i = 0, c = 0, start = new Date(), duration,
            l = new MultiLoop({
                fun               : function(finished) {
                    i++;
                    finished();
                },
                rpsProfile        : [
                    [2, 10],
                    [3, 0]
                ],
                concurrencyProfile: [
                    [1, 5],
                    [2, 10]
                ],
                duration          : 3.5
            }).start();

        l.on('end', function() {
            duration = new Date() - start;

            assert.equal(i, 15, 'loop executed incorrect number of times: ' + i);
            assert.ok(l.loops.every(function(l) {
                return !l.running;
            }), 'loops still flagged as running');
            assert.ok(Math.abs(duration - 3500) < 500, '3500 == ' + duration);

            done();
        });
    });

    it('test numberOfTimes loop', function(done) {
        var i = 0,
            l = new Loop({
                fun          : function(finished) {
                    i++;
                    finished();
                },
                rps          : 5,
                numberOfTimes: 3
            }).start();

        l.on('end', function() {
            assert.equal(3, i, 'loop executed incorrect number of times');
            done();
        });
    });

    it('test emits start and stop events', function(done) {
        var started, ended,
            l = new Loop({
                fun          : function(finished) {
                    finished();
                },
                rps          : 10,
                numberOfTimes: 3
            }).start();

        l.on('start', function() {
            started = true;
        });
        l.on('end', function() {
            assert.ok(started, 'start never emitted');
            done();
        });
    });

    it('test concurrency', function(done) {
        var i = 0, start = new Date(), duration,
            l = new MultiLoop({
                fun        : function(finished) {
                    i++;
                    finished();
                },
                rps        : 10,
                duration   : 1,
                concurrency: 5
            }).start();

        l.on('end', function() {
            duration = new Date() - start;

            assert.equal(l.loops.length, 5);
            assert.equal(i, 10, 'loop executed incorrect number of times');
            assert.ok(l.loops.every(function(l) {
                return !l.running;
            }), 'loops still flagged as running');
            assert.ok(Math.abs(duration - 1000) < 30, '1000 == ' + duration);

            done();
        });
    });

    it('MultiLoop emits events', function(done) {
        var started = false, ended = false,
            l = new MultiLoop({
                fun          : function(finished) {
                    finished();
                },
                numberOfTimes: 3
            }).start();

        l.on('start', function() {
            started = true;
        });
        l.on('end', function() {
            ended = true;

            assert.ok(started, 'start never emitted');
            done();
        });
    });

    it('change loop rate', function(done) {
        var i = 0, start = new Date(), duration,
            l = new Loop({
                fun     : function(finished) {
                    i++;
                    finished();
                },
                rps     : 5,
                duration: 2
            }).start();

        l.on('end', function() {
            duration = new Date() - start;

            assert.ok(Math.abs(20 - i) <= 1, 'loop executed incorrect number of times: ' + i); // 5+10/2+20/2 == 20
            assert.ok(!l.running, 'loop still flagged as running');
            assert.ok(Math.abs(duration - 2000) <= 50, '2000 == ' + duration);

            done();
        });
        setTimeout(function() {
            l.rps = 10;
        }, 1000);
        setTimeout(function() {
            l.rps = 20;
        }, 1500);

    });

    it('test MultiLoop.getProfileValue_ works', function() {
        var getProfileValue = loop.MultiLoop.prototype.getProfileValue_;
        assert.equal(getProfileValue(null, 10), 0);
        assert.equal(getProfileValue(null, 10), 0);
        assert.equal(getProfileValue([], 10), 0);

        assert.equal(getProfileValue([
            [0, 0]
        ], 0), 0);
        assert.equal(getProfileValue([
            [0, 10]
        ], 0), 10);
        assert.equal(getProfileValue([
            [0, 0],
            [10, 0]
        ], 5), 0);
        assert.equal(getProfileValue([
            [0, 0],
            [10, 100]
        ], 5), 50);
        assert.equal(getProfileValue([
            [0, 0],
            [11, 100]
        ], 5), 45);

        var profile = [
            [0, 0],
            [10, 100],
            [15, 100],
            [22, 500],
            [30, 500],
            [32, 0]
        ];
        assert.equal(getProfileValue(profile, -1), 0);
        assert.equal(getProfileValue(profile, 0), 0);
        assert.equal(getProfileValue(profile, 1), 10);
        assert.equal(getProfileValue(profile, 1.5), 15);
        assert.equal(getProfileValue(profile, 10), 100);
        assert.equal(getProfileValue(profile, 14), 100);
        assert.equal(getProfileValue(profile, 21), 442);
        assert.equal(getProfileValue(profile, 30), 500);
        assert.equal(getProfileValue(profile, 31), 250);
        assert.equal(getProfileValue(profile, 32), 0);
        assert.equal(getProfileValue(profile, 35), 0);
    });

    it('test MultiLoop.getProfileTimeToNextValue_ works', function() {
        var getProfileTimeToNextValue = loop.MultiLoop.prototype.getProfileTimeToNextValue_;
        assert.equal(getProfileTimeToNextValue(null, 10), Infinity);
        assert.equal(getProfileTimeToNextValue([], 10), Infinity);

        assert.equal(getProfileTimeToNextValue([
            [0, 10]
        ], 0), Infinity);
        assert.equal(getProfileTimeToNextValue([
            [0, 0],
            [10, 0]
        ], 0), 10);
        assert.equal(getProfileTimeToNextValue([
            [0, 0],
            [10, 100]
        ], 0), 1);
        assert.equal(getProfileTimeToNextValue([
            [0, 0],
            [10, 0]
        ], 4), 6);
        assert.equal(getProfileTimeToNextValue([
            [0, 0],
            [10, 5]
        ], 4), 2);
        assert.equal(getProfileTimeToNextValue([
            [0, 0],
            [10, 5]
        ], 4.5), 2); // should round up to nearest whole number
        assert.equal(getProfileTimeToNextValue([
            [0, 0],
            [10, 5]
        ], 5), 1);
        assert.equal(getProfileTimeToNextValue([
            [0, 0],
            [10, 0]
        ], 10), Infinity);

        var profile = [
            [0, 0],
            [10, 100],
            [15, 100],
            [22, 1],
            [30, 0]
        ];
        assert.equal(getProfileTimeToNextValue(profile, -1), 1);
        assert.equal(getProfileTimeToNextValue(profile, 0), 1);
        assert.equal(getProfileTimeToNextValue(profile, 1), 1);
        assert.equal(getProfileTimeToNextValue(profile, 1.5), 1);
        assert.equal(getProfileTimeToNextValue(profile, 10), 5);
        assert.equal(getProfileTimeToNextValue(profile, 13.5), 2);
        assert.equal(getProfileTimeToNextValue(profile, 15), 1);
        assert.equal(getProfileTimeToNextValue(profile, 21), 1);
        assert.equal(getProfileTimeToNextValue(profile, 22), 8);
        assert.equal(getProfileTimeToNextValue(profile, 28.5), 2);
        assert.equal(getProfileTimeToNextValue(profile, 29.5), 1);
        assert.equal(getProfileTimeToNextValue(profile, 30), Infinity);
    });

    it('test MultiLoop.getProfileValue_ and MultiLoop.getProfileTimeToNextValue_ coordination', function() {
        var getProfileValue = loop.MultiLoop.prototype.getProfileValue_;
        var getProfileTimeToNextValue = loop.MultiLoop.prototype.getProfileTimeToNextValue_;
        var profile = [
            [0, 0],
            [10, 100],
            [15, 100],
            [22, 500],
            [30, 500],
            [32, 0]
        ];
        assert.equal(getProfileValue(profile, 0), 0);
        assert.equal(getProfileTimeToNextValue(profile, 0), 1);
        assert.equal(getProfileValue(profile, 1), 10);
        assert.equal(getProfileTimeToNextValue(profile, 1), 1);
        assert.equal(getProfileValue(profile, 9), 90);
        assert.equal(getProfileTimeToNextValue(profile, 9), 1);
        assert.equal(getProfileValue(profile, 10), 100);
        assert.equal(getProfileTimeToNextValue(profile, 10), 5);
        assert.equal(getProfileValue(profile, 15), 100);
        assert.equal(getProfileTimeToNextValue(profile, 15), 1);
        assert.equal(getProfileValue(profile, 16), 157);
        assert.equal(getProfileTimeToNextValue(profile, 16), 1);
        assert.equal(getProfileValue(profile, 21), 442);
        assert.equal(getProfileTimeToNextValue(profile, 21), 1);
        assert.equal(getProfileValue(profile, 22), 500);
        assert.equal(getProfileTimeToNextValue(profile, 22), 8);
        assert.equal(getProfileValue(profile, 30), 500);
        assert.equal(getProfileTimeToNextValue(profile, 30), 1);
        assert.equal(getProfileValue(profile, 31), 250);
        assert.equal(getProfileTimeToNextValue(profile, 31), 1);
        assert.equal(getProfileValue(profile, 32), 0);
        assert.equal(getProfileTimeToNextValue(profile, 32), Infinity);
    });

});