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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.initConfig({
        copy: {
            'assemblyscript-loader': {
                src: 'node_modules/assemblyscript-loader/dist/assemblyscript-loader.js',
                dest: 'dist/',
                filter: 'isFile',
                flatten: true,
                expand: true
            },
            'long': {
                src: 'node_modules/long/dist/long.js',
                dest: 'dist/',
                filter: 'isFile',
                flatten: true,
                expand: true
            }
        },
        screeps: {
            options: {
                email: email,
                password: password,
                branch: branch,
                ptr: ptr
            },
            dist: {
                src: ['dist/*']
            }
        }
    });
    grunt.registerTask('default', ['copy', 'screeps']);
};

