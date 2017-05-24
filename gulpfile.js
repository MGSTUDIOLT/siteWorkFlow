var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var merge = require('merge-stream');

var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss',
    htmlSource : 'src/*.html',
    jsSource : 'src/js/**'
}
var APPPATH = {
    root : 'app/',
    css : 'app/css',
    js : 'app/js',
    fonts : 'app/fonts'
}

// ISVALOM FAILUS KURIE BUVO PASALINTI IS SRC
gulp.task('clean-html', function() {
    return gulp.src(APPPATH.root + '/*.html', { read: false, force: true })
        .pipe(clean());
});

gulp.task('clean-scripts', function() {
    return gulp.src(APPPATH.js + '/*.js', { read: false, force: true })
        .pipe(clean());
});

// SASS COMPILIATORIUS
gulp.task('sass', function() {
    
    // idedam css i bootstrap ir sujungiam, kad butu vienas failas
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    var sassFiles;
    
    sassFiles = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer()) // compressed
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError));
    
    return merge(sassFiles, bootstrapCSS)
        .pipe(concat('app.css'))
        .pipe(gulp.dest(APPPATH.css));
});

gulp.task('moveFonts', function() {
    gulp.src('./node_modules/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest(APPPATH.fonts));
});

// KOPIJUOJAM JS
gulp.task('scripts', ['clean-scripts'], function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(concat('main.js'))
        .pipe(browserify())
        .pipe(gulp.dest(APPPATH.js));
});

// COPY HTML FILE TO APP (Bus naudojamos dependencies, include kaip php, compress del to automatiskai bus sukuriami patobulinti failai app folder)
gulp.task('copy', ['clean-html'], function() {
    gulp.src(SOURCEPATHS.htmlSource) 
        .pipe(gulp.dest(APPPATH.root));
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
gulp.task('watch', ['serve', 'sass', 'copy', 'clean-html', 'clean-scripts', 'scripts', 'moveFonts'], function() {
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
    gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
    gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
});

gulp.task('default', ['watch']);