var gulp = require('gulp');
var webserver = require('gulp-webserver');
var requireDir = require('require-directory');
var browserify = require('browserify');
var commons = requireDir(module,'./libs/common');
var source = require('vinyl-source-stream');
var yuidoc = require("gulp-yuidoc");
var plumber = require('gulp-plumber');
var notify  = require('gulp-notify');
var exec = require('gulp-exec');
var electron = require('electron-connect').server.create();
var packager = require('electron-packager');
var del = require('del');
var execSync = require('child_process').execSync;


// NodeJS Server
var spawn = require('child_process').spawn;
var node;

// Browser livereload Server
var stream;



// NodeJS Server restart
gulp.task('server', function() {
    if (node) node.kill();
    node = spawn('node', ['--debug','app.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

// クライアント起動（ブラウザ,electron）
gulp.task('init',['server','copy'], function() {
    
    // Electronの起動
    electron.start();

    // Browser livereload
    stream = gulp.src('./')
        .pipe(webserver({
        livereload: {
            host: '0.0.0.0',
            enable: true, 
            filter: function(fileName) {    
                if (fileName.match(/doc/) || 
                    fileName.match(/report/) ||
                    fileName.match(/client/) || 
                    fileName.match(/libs/) || 
                    fileName.match(/db/)) { 
                    return false;
                } else {
                    return true;
                }
            }
        },
        open: true
    }));
});

// electro-livereload
gulp.task('electron-reload',['copy','copy_html'], function() {

    //stream.reload();
    // RendererProcessが読み込むリソースが変更されたら, RendererProcessにreloadさせる
    electron.reload();
});

// unit test
gulp.task('unittest', function() {
    
    var options = {
        continueOnError: false, 
        pipeStdout: false 
    };
    var reportOptions = {
        err: true, 
        stderr: true,
        stdout: true 
    };
    return gulp.src('./spec/*.js')
                .pipe(plumber({
                    errorHandler: notify.onError("Error: <%= error.message %>") 
                }))
                .pipe(exec('jasmine-node <%= file.path %>', options))
                .pipe(exec.reporter(reportOptions));
});

// browserify
gulp.task('browserify', function() {
    
    var entries = [];
    for(var i in commons){
        entries.push(i + '.js');    
    }
    
    var promise = browserify({
        basedir: 'libs/common/',
        entries:entries,
        debug:true
    });
    
    for(var j=0;j<entries.length;++j){
        promise = promise.require('./'+entries[j],{expose:entries[j]});
    }
    
    return promise.bundle()
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>") 
        }))
        .pipe(source('common.js'))        
        .pipe(gulp.dest('build'));    
});



// copy
gulp.task('copy',['browserify'], function() {

    return gulp.src([ 'bower_components/**', 'build/**' ],
                    { base: './' })
                .pipe( gulp.dest( 'client/browser' ) )
                .pipe( gulp.dest('client/android/app/src/main/assets' ))
                .pipe( gulp.dest('client/ios/bridge/html' ));
});

gulp.task('copy_html', function() {

    return gulp.src([ 'index.html' ],
                    { base: './' })
        .pipe( gulp.dest( 'client/browser' ) )
        .pipe( gulp.dest('client/android/app/src/main/assets' ))
        .pipe( gulp.dest('client/ios/bridge/html' ));
});

// electron package
gulp.task('package', ['copy'], function (done) {
    packager({
        dir: '.',             
        out: 'client',    
        name: 'bridge',   // アプリケーション名
        arch: 'x64',             
        platform: 'darwin,win32',   
        version: '1.3.2',   // Electronのversion
        overwrite:true
    }, function (err, path) {
        done();
    });
});

// document
gulp.task('doc', function(){
    return gulp.src("./libs/common/*.js")
               .pipe(plumber({
                    errorHandler: notify.onError("Error: <%= error.message %>") 
               }))
               .pipe(yuidoc())
               .pipe(gulp.dest("./doc"));
});

// report
gulp.task('plato', function() {
    
    var options = {
        continueOnError: false, 
        pipeStdout: false 
    };
    var reportOptions = {
        err: true, 
        stderr: true,
        stdout: true 
    };
    return gulp.src('.')
                .pipe(plumber({
                    errorHandler: notify.onError("Error: <%= error.message %>") 
                }))
                .pipe(exec('grunt plato', options))
                .pipe(exec.reporter(reportOptions));
    
});

// clean up process when gulp end
process.on('exit', function() {
    console.log("exit gulp");
    // stop gulp-webserver
    if(stream) stream.emit('kill');
    // stop NodeJS Server
    if (node) node.kill();
});

// clean up auto created module(npm install,bower install,browserify,electron)
gulp.task('clean', function(done) {
    var result = "" + execSync('find . -name .DS_Store -exec rm -fr {} \\;');
    del(['node_modules', 'bower_components','build','doc','report','db/*', 'client/browser','client/bridge-darwin-x64','client/bridge-win32-x64','client/android/app/src/main/assets/*','client/ios/bridge/html/*'], done);
});

gulp.task('default',['init','unittest','doc','plato'], function () {
    gulp.watch(['./app.js'], ['server']);
    // BrowserProcess(MainProcess)が読み込むリソースが変更されたら, Electron自体を再起動
    gulp.watch(['./main.js'],electron.restart);
    gulp.watch(['./index.html'],['copy_html'], electron.reload);
    gulp.watch(['./libs/**/*.js'], ['server','unittest','electron-reload','doc','plato']);
    gulp.watch(['./spec/*.js','./spec/*.json'], ['unittest']);
}); 
