'use strict';
var path = require('path'),
    fs = require('fs');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        concat: {
            dist: {
                src: ['lib/header.js', 'lib/**/*.js'],
                dest: 'nodeload.js'
            }
        },
        jshint: {
            gruntfile: ['Gruntfile.js'],
            libs_n_tests: ['lib/**/*.js'],
            options: grunt.file.readJSON(path.join(__dirname,'.jshintrc'))
        },
        watch: {
            gruntfile: {
                files: ['<%= jshint.gruntfile %>'],
                tasks: ['jshint:gruntfile']
            },
            libs_n_tests: {
                files: ['<%= jshint.libs_n_tests %>'],
                tasks: ['jshint:libs_n_tests']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // "npm test" runs these tasks
    grunt.registerTask('test', ['jshint']);

    // Default task.
    grunt.registerTask('default', ['test', 'clean-templates', 'compile-templates']);

    grunt.registerTask('clean-templates', 'Clean reoprt templates.', function() {
        grunt.log.write('Cleaning up ./lib/reporting/*.tpl.js ...');

        fs.unlinkSync('lib/reporting/summary.tpl.js');
        fs.unlinkSync('lib/reporting/dygraph.tpl.js');

        grunt.log.ok('Removed lib/reporting/*.tpl.js');
    });

    grunt.registerTask('compile-templates', 'Compiling report templates.', function() {
        var summary = fs.openSync('lib/reporting/summary.tpl.js', 'a'),
            dygraph = fs.openSync('lib/reporting/dygraph.tpl.js', 'a');
        grunt.util.async.waterfall([
            function(done){
                grunt.util.spawn({
                    cmd: 'node',
                    args: ['scripts/process_tpl.js', 'REPORT_SUMMARY_TEMPLATE', 'lib/reporting/summary.tpl'],
                    opts: { stdio: ['pipe', summary, 'pipe'] }
                }, function(error, result) {
                    if (!error) {
                        grunt.verbose.ok('Finished compiling lib/reporting/summary.tpl.js');
                        done();
                    } else {
                        grunt.verbose.warn('Failed compiling lib/reporting/summary.tpl.js');
                        done(error);
                    }
                });
            },
            function(done){
                grunt.util.spawn({
                    cmd: 'node',
                    args: ['scripts/process_tpl.js', 'DYGRAPH_SOURCE', 'lib/reporting/dygraph.tpl'],
                    opts: { stdio: ['pipe', dygraph, 'pipe'] }
                }, function(error, result) {
                    if (!error) {
                        grunt.verbose.ok('Finished compiling lib/reporting/dygraph.tpl.js');
                        done(null);
                    } else {
                        grunt.verbose.warn('Failed compiling lib/reporting/dygraph.tpl.js');
                        done();
                    }
                });
            }],

            function(err){
                fs.closeSync(summary);
                fs.closeSync(dygraph);
                if(err){
                    grunt.verbose.warn(err.message);
                } else {
                    grunt.log.write('Finished compiling templates...').ok();
                }
            });

            this.async();
    });

};