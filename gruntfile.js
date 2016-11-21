module.exports = function(grunt) {

    var addVersion = function(content) {
        var d = new Date();
        var m = d.getMonth() + 1;
        var s = 'Time: ' + m + '/' + d.getDate() + '/' + d.getFullYear() + ', ' + d.getHours() + ':' + d.getMinutes();
        return content.replace(/@@VERSION@@/, s);
    };
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        localConfig: grunt.file.readJSON('localConfig.json'),
        copy: {
            main: {
                files: [{
                        expand: true,
                        cwd: 'bower_components/angular/',
                        src: 'angular.min.js',
                        dest: 'public/app/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular/',
                        src: 'angular.min.js.map',
                        dest: 'public/app/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-bootstrap/',
                        src: 'ui-bootstrap-tpls.min.js',
                        dest: 'public/app/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-route/',
                        src: 'angular-route.min.js*',
                        dest: 'public/app/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/bootstrap/fonts/',
                        src: '*.*',
                        dest: 'public/app/css/fonts',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/bootstrap/dist/css',
                        src: '**',
                        dest: 'public/app/css/bootstrap',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-mocks/',
                        src: '*.js',
                        dest: 'public/test/mocks',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/sinon/lib',
                        src: '*.js',
                        dest: 'public/test/mocks',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/ng-file-upload/',
                        src: 'angular-file-upload.min.js',
                        dest: 'public/app/js/angular',
                        filter: 'isFile'
                    }

                ]
            },
            toDevUnmodified: {
                expand: true,
                cwd: 'public',
                src: ['**', '!**/*.js', '!**/.html', '!opener.html', '!opener.tfn.html', '!test/**'],
                filter: 'isFile',
                nonull: true,
                dest: '<%= localConfig.PCT_WEB_ROOT %>'
            },
            toDevModified: {
                expand: true,
                cwd: 'public',
                src: ['**/*.js', '**/*.html', '!opener.html', '!opener.tfn.html'],
                filter: 'isFile',
                nonull: true,
                dest: '<%= localConfig.PCT_WEB_ROOT %>',
                options: {
                    process: function(content, src) {
                        var n = new Date().getTime();
                        if (src.indexOf('index.html') !== -1) {
                            content = addVersion(content, src);
                        }
                        return content.replace(/\?_=date-param/g, "?_=" + n);
                    }
                }
            },
            toDevRoot: {
                expand: true,
                cwd: './',
                src: ['index.html'],
                filter: 'isFile',
                nonull: true,
                dest: '<%= localConfig.PCT_WEB_ROOT %>',
                options: {
                    process: function(content, src) {
                        var n = new Date().getTime();
                        if (src.indexOf('index.html') !== -1) {
                            content = addVersion(content, src);
                        }
                        return content.replace(/\?_=date-param/g, "?_=" + n);
                    }
                }
            }
        },
        clean: {
            connect: {
                src: ['<%= localConfig.PCT_WEB_ROOT %>'],
                options: {
                    force: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['copy:main']);
    grunt.registerTask('toPct', ['clean:connect', 'copy:toDevUnmodified', 'copy:toDevModified', 'copy:toDevRoot']);
};