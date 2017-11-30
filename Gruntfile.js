module.exports = function(grunt){
    var config = require('./.screeps.json');
    if(!config.branch){
        config.branch = 'sim';
    }
    if(!config.ptr){
        config.ptr = false;
    }
    var branch = grunt.option('branch') || config.branch, // eslint-disable-line one-var
        email = grunt.option('email') || config.email,
        password = grunt.option('password') || config.password,
        ptr = grunt.option('ptr') ? true : config.ptr;
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-file-append');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.initConfig({
        screeps: {
            options: {
                email: email,
                password: password,
                branch: branch,
                ptr: ptr
            },
            dist: {
                src: ['dist/*.js']
            }
        },
        concat: {
            classes: {
                options: {
                    banner: 'let classes = module.exports = {};\n'
                },
                src: ['dist/classes_basic.js', 'dist/classes_*.js'],
                dest: 'dist/_classes.js'
            },
            roles: {
                options: {
                    banner: 'let classes = require(\'classes\'),\n    Role = classes.Role,\n    roles = module.exports = {};\n'
                },
                src: ['dist/roles_*.js'],
                dest: 'dist/_roles.js'
            }
        },
        copy: {
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function(dest, src){
                        return dest + src.replace(/\//g, '_');
                    }
                }]
            }
        },
        clean: {
            'dist': ['dist/classes_*.js', 'roles_*.js']
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'src/**/*.js'],
                tasks: ['default'],
                options: {spawn: false}
            }
        },
        'string-replace': {
            classes: {
                files: [{
                    src: 'dist/_classes.js',
                    dest: 'dist/_classes.js'
                }],
                options: {
                    replacements: [
                        {
                            pattern: /^class ([^{ ]+) extends classes.([^{]+)\{/igm,
                            replacement: 'module.exports.$1 = class $1 extends classes.$2{'
                        },
                        {
                            pattern: /^class ([^{ ]+)\{/igm,
                            replacement: 'module.exports.$1 = class $1{'
                        }
                    ]
                }
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function(dest, src){
                        return dest + src.replace(/\//g, '_');
                    }
                }],
                options: {
                    replacements: [
                        {
                            pattern: /require\((['"])([^'"/]+['"])\)(;?)/ig,
                            replacement: 'require($1_$2)$3'
                        },
                        {
                            pattern: /require\((['"][^/]+)\/([^'"]+['"])\)(;?)/ig,
                            replacement: 'require($1_$2)$3'
                        }
                    ]
                }
            }
        }
    });
    grunt.registerTask('default', ['copy', 'concat', 'string-replace', 'clean', 'screeps']);
};

