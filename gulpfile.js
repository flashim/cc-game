const gulp = require('gulp');
const path = require('path');
const del = require('del');
//const jshint = require('gulp-jshint');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

var dateFormat = require('dateformat');

// const babel = require('gulp-babel');
/*
gulp.task('transpile', () => {
	gulp
		.src('./src/*.js')
		.pipe(
			babel({
				presets: [ 'es2015' ]
			})
		)
		.pipe(gulp.dest('./dist'));
});

gulp.task('watch', () => {
	gulp.watch('./src/*.js', [ 'transpile' ]);
}); 


 gulp.task('concat-copyright-version', function () {
    gulp.src('./JavaScript/*.js')
    .pipe(concat('concat-copyright-version.js')) // concat and name it "concat-copyright-version.js"
    .pipe(header(getCopyrightVersion(), {version: getVersion()}))
    .pipe(gulp.dest('path/to/destination'));
 }); 
// Lint JavaScript
gulp.task('jsLint', function () {
    gulp.src('./JavaScript/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter());
});

*/

gulp.task('copyFiles', function() {
	return gulp.src('templates/*', '!lib/').pipe(gulp.dest('dist/'));
});

gulp.task('copyAssets', function() {
	return gulp.src('public/assets/**/*').pipe(gulp.dest('dist/assets/'));
});

gulp.task('copyJs', function() {
	return gulp.src('public/fl_assets.js').pipe(gulp.dest('dist/assets/js/'));
});

gulp.task('copyJs-dev', function() {
	return gulp.src('public/fl_assets.js').pipe(gulp.dest('public/assets/js/'));
});

// minify lib
gulp.task('compressLibJs', function() {
	return gulp.src('templates/lib/*.js').pipe(concat('lib.js')).pipe(uglify()).pipe(gulp.dest('dist/assets/js/'));
});

gulp.task('compressLibJs-dev', function() {
	return gulp.src('templates/lib/*.js').pipe(concat('lib.js')).pipe(uglify()).pipe(gulp.dest('public/assets/js/'));
});

//.. this is for bubble babble ------------
gulp.task('BBLib', function() {
	return gulp.src('templates/bblib/*.js').pipe(concat('bblib.js')).pipe(uglify()).pipe(gulp.dest('dist/assets/js/'));
});
//... this is for bubble babble ends ------

gulp.task('copyhtml-dev', function() {
	return gulp.src('templates/index.html').pipe(gulp.dest('public/'));
});

gulp.task('deleteUseless', function() {
	return del([ './dist/bblib', './dist/lib' ]);
});

gulp.task('clean', function() {
	return del([ './dist/' ]);
});

gulp.task('copy2lol', function() {
	var dt = dateFormat(new Date(), "isoDate");
	var loc = '//lollipop/Operations/Projects/ABC/Ashim/TataClassEdge/dist/canvas/cricket/' + dt +'/';

	return gulp
		.src('dist/**/*')
		.pipe(gulp.dest(loc));
});

gulp.task('build', gulp.series('clean', 'copyFiles', 'copyAssets', 'copyJs', 'compressLibJs', 'deleteUseless')); //
gulp.task('dev', gulp.series('copyhtml-dev', 'compressLibJs-dev', 'copyJs-dev'));

