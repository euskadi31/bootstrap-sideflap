/**
 * Dacteev CRM
 *
 * @author      Axel Etcheverry
 * @copyright   Copyright (c) 2013 Dacteev.
 */

var bower = require('bower');

module.exports = function(grunt) {

    grunt.registerTask('bower', 'Install Bower packages.', function() {
        var done = this.async();

        bower.commands.install()
            .on('log', function(result) {
                grunt.log.ok('bower: ' + result.id + ' ' + result.data.endpoint.name);
            })
            .on('error', grunt.fail.warn.bind(grunt.fail))
            .on('end', done);
    });

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["./dist"],
        mkdir: {
            dist: {
                options: {
                    create: [
                        './dist',
                        './dist/css',
                        './dist/js'
                    ]
                }
            }
        },
        jshint: {
            options: {
                jshintrc: 'js/.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            js: {
                src: './js/**/*.js'
            }
        },
        uglify: {
            options: {
                banner: '/**\n * Bootstrap SideFlap\n * <%= grunt.template.today("yyyy-mm-dd") %>\n */\n'
            },
            app: {
                src: './js/sideflap.js',
                dest: './dist/js/sideflap.min.js'
            }
        },
        less: {
            dev: {
                options: {
                    paths: [
                        './less',
                        './bower_components'
                    ]
                },
                files: {
                    "./dist/css/sideflap.css": "./less/sideflap.less"
                }
            },
            prod: {
                options: {
                    paths: [
                        './less',
                        './bower_components'
                    ],
                    yuicompress: true
                },
                files: {
                    "./dist/css/sideflap.min.css": "./less/sideflap.less"
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            uglify: {
                files: '<%= jshint.js.src %>',
                tasks: ['jshint:scripts', 'uglify']
            },
            less: {
                files: [
                    './less/sideflap.less',
                    './less/**/*.less'
                ],
                tasks: ['less']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');

    // Default task(s).
    grunt.registerTask('default', [
        'clean',
        'bower',
        'mkdir',
        'jshint',
        'uglify',
        'less',
        'watch'
    ]);

    grunt.registerTask('dist', [
        'bower',
        'mkdir',
        'jshint',
        'uglify',
        'less'
    ]);
};
