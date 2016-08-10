module.exports = function(grunt){
    grunt.initConfig({
        plato:{
            options:{
                jshint: grunt.file.readJSON('.jshintrc'),
                complexity:{
                    logicalor:true,
                    switchcase:true,
                    forin:true,
                    trycatch:true
                }
            },
            dist:{
                files:{
                    './report':['libs/common/**/*.js']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-plato');
};