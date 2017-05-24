var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');

var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss',
    htmlSource : 'src/*.html'
}
var APPPATH = {
    root : 'app/',
    css : 'app/css',
    js : 'app/js'
}

// SASS COMPILIATORIUS
gulp.task('sass', function() {
    return gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer()) // compressed
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(gulp.dest(APPPATH.css))
});

// COPY HTML FILE TO APP
gulp.task('copy', function() {
    gulp.src(SOURCEPATHS.htmlSource) 
        .pipe(gulp.dest(APPPATH.root))
});

// AUTOMATISKAI ATNAUJINS NARSYKLES LANGA
gulp.task('serve', ['sass'], function() {
    browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
        server: {
            baseDir : APPPATH.root
        }
    })
});

// watch kad stebetu scss ir padarytu kai kazka pakeiciam
gulp.task('watch', ['serve', 'sass', 'copy'], function() {
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
    gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
});

gulp.task('default', ['watch']);