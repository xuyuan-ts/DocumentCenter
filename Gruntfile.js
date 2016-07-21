'use strict';

var request = require('request');

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var reloadPort = 35729, files;

    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        develop: {
            server: {
                file: 'app.js'
            }
        },
        less: {
            dist: {
                files: {
                    'public/dist/css/style.css': 'public/less/style.less'
                }
            }
        },
        watch: {
            options: {
                nospawn: true,
                livereload: reloadPort
            },
            server: {
                files: [
                    'app.js',
                    'routes/*.js',
                    'utils/*.js',
                    'documents/**/*'
                ],
                tasks: ['copy', 'markdown', 'develop', 'delayed-livereload']
            },
            js: {
                files: ['public/js/*.js'],
                options: {
                    livereload: reloadPort
                }
            },
            css: {
                files: [
                    'public/less/*.less'
                ],
                tasks: ['less'],
                options: {
                    livereload: reloadPort
                }
            },
            views: {
                files: ['views/*.handlebars'],
                options: {
                    livereload: reloadPort
                }
            }
        },
        markdown: {
            all: {
                files: [
                    {
                        expand: true,
                        src: 'documents/**/*.md',
                        dest: 'public/dist',
                        ext: '.html'
                    }
                ],
                options: {
                    preCompile: function (src, context) {
                        //var reg = /\!\[.*\]\(\w*.png\)/ig;
                        var reg = /\!\[.*\]\(\w*(.png|.jpg|.jpeg|.gif)\)/ig;
                        var newSrc=src.replace(reg, function (matchedStr) {
                            var imagePath = matchedStr.substring(matchedStr.lastIndexOf('(')+1, matchedStr.lastIndexOf(')'));
                            var parsedPath = matchedStr.replace(imagePath, '/dist/documents/images/'+imagePath);
                            return parsedPath;
                        });
                        return newSrc;
                    }
                }
            }
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: [
                            'documents/**/*.png', 'documents/**/*.PNG',
                            'documents/**/*.gif', 'documents/**/*.GIF',
                            'documents/**/*.jpg', 'documents/**/*.JPG',
                            'documents/**/*.jpeg', 'documents/**/*.JPEG'
                        ],
                        dest: 'public/dist/documents/images',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            }
        }
    });

    grunt.config.requires('watch.server.files');
    files = grunt.config('watch.server.files');
    files = grunt.file.expand(files);

    grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
        var done = this.async();
        setTimeout(function () {
            request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','), function (err, res) {
                var reloaded = !err && res.statusCode === 200;
                if (reloaded) {
                    grunt.log.ok('Delayed live reload successful.');
                } else {
                    grunt.log.error('Unable to make a delayed live reload.');
                }
                done(reloaded);
            });
        }, 500);
    });

    grunt.registerTask('default', [
        'less',
        'develop',
        'markdown',
        'copy',
        'watch'
    ]);

    grunt.registerTask('deploy', [
        'less',
        'markdown'
    ]);
};
