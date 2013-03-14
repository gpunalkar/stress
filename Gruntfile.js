'use strict';
var path = require('path');

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
    grunt.registerTask('default', ['test']);
};