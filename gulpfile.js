var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var merge = require('merge-stream');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var injectPartials = require('gulp-inject-partials');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');

var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss',
    htmlSource : 'src/*.html',
    htmlPartials : 'src/partial/*.html',
    jsSource : 'src/js/**',
    imgSource : 'src/img/**'
}
var APPPATH = {
    root : 'app/',
    css : 'app/css',
    js : 'app/js',
    fonts : 'app/fonts',
    img : 'app/img'
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

// KAD SUSPAUSTU IMG
gulp.task('images', function() {
    return gulp.src(SOURCEPATHS.imgSource)
        .pipe(newer(APPPATH.img))
        .pipe(imagemin())
        .pipe(gulp.dest(APPPATH.img));
});

// PERKELIAM FONTUS I APP
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

// PRODUCTION TASK - MINIFY
gulp.task('compress', function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(concat('main.js'))
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest(APPPATH.js));
});

gulp.task('compressCss', function() {
    
    // idedam css i bootstrap ir sujungiam, kad butu vienas failas
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    var sassFiles;
    
    sassFiles = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer()) // compressed
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError));
    
    return merge(sassFiles, bootstrapCSS)
        .pipe(concat('app.css'))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(APPPATH.css));
});
// END PRODUCTION

// KAIP PHP INCLUDE TAI CIA TAS PATS HTML
gulp.task('html', function() {
    return gulp.src(SOURCEPATHS.htmlSource) 
        .pipe(injectPartials())
        .pipe(gulp.dest(APPPATH.root))
});

// COPY HTML FILE TO APP (Bus naudojamos dependencies, include kaip php, compress del to automatiskai bus sukuriami patobulinti failai app folder)
//gulp.task('copy', ['clean-html'], function() {
//    gulp.src(SOURCEPATHS.htmlSource) 
//        .pipe(gulp.dest(APPPATH.root));
//});

// AUTOMATISKAI ATNAUJINS NARSYKLES LANGA
gulp.task('serve', ['sass'], function() {
    browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
        server: {
            baseDir : APPPATH.root
        }
    })
});

// watch kad stebetu scss ir padarytu kai kazka pakeiciam
gulp.task('watch', ['serve', 'sass', 'clean-html', 'clean-scripts', 'scripts', 'moveFonts', 'images', 'html', 'compress', 'compressCss'], function() {
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
//    gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
    gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
    gulp.watch([SOURCEPATHS.imgSource], ['images']);
    gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartials], ['html']);
});

gulp.task('default', ['watch']);