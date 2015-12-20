'use strict';
var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	inject = require('gulp-inject'),
	gulpif = require('gulp-if'),
	minifyCss = require('gulp-minify-css'),
	useref = require('gulp-useref'),
	uglify = require('gulp-uglify');
	
gulp.task('jshint', function() {
	return gulp.src('./app/js/**/*.js')
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter('jshint-stylish'))
	.pipe(jshint.reporter('fail'));
});

gulp.task('inject', function() {
	var sources = gulp.src([
		'./node_modules/jquery/dist/**/*.min.js',
		'./node_modules/bootstrap/dist/**/*.min.js',
		'./node_modules/bootstrap-validator/dist/*.min.js',
		'./app/js/**/*.js',
		'./node_modules/bootstrap/**/*.min.css',
		'./app/css/**/*.css',
		]);
	return gulp.src('index.html', {cwd: './app'})
	.pipe(inject(sources, {
		read: false,
		relative: true
	}))
	.pipe(gulp.dest('./app/'));
 });

gulp.task('html', function() {
   return gulp.src('./app/index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('./public'));
});

gulp.task('copy', function() {
   return gulp.src('./node_modules/bootstrap/fonts/**')
     .pipe(gulp.dest('./public/fonts'));
});


gulp.task('watch', function() {
	gulp.watch(['./app/js/**/*.js', './gulpfile.js'], ['jshint']);
});
 
gulp.task('default', ['jshint', 'inject']);
gulp.task('build', ['html', 'copy']);