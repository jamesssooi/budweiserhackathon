// dependency imports
var gulp = require('gulp');
var sass = require('gulp-sass');
var inject = require('gulp-inject');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var angularFilesort = require('gulp-angular-filesort');
var del = require('del');
var runSequence = require('run-sequence');
var series = require('stream-series');

// Watch files for changes
var watch = function() {
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('src/js/**/*.js', ['inject']);	
};

// Default gulp action
gulp.task('default', watch());

// Process SASS files
gulp.task('sass', function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('src/css'))
		.pipe(gulp.dest('dist/css'))
});

// Inject JS files
gulp.task('inject', function() {
	var target = gulp.src('src/index.html');
	
	var all = gulp.src(['src/js/**/*.js', '!src/js/lib/**/*.js', '!src/js/main.js']).pipe(angularFilesort())
	var lib = gulp.src('src/js/lib/**/*.js', {read: false});
	//var src = gulp.src(['src/js/**/*.js', '!src/js/lib/**/*.js', '!src/js/main.js'], {read: false});
	var main = gulp.src('src/js/main.js', {read: false});
	
	return target.pipe(inject(series(lib, main, all), {relative: true}))
		.pipe(gulp.dest('src'))
});

// Concatenate JS files
gulp.task('concat', function() {
	
	var assets = useref.assets();
	
	return gulp.src('src/*.html')
		.pipe(assets)
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', minifyCSS()))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'))
});

// Transfer image files
gulp.task('images', function() {
	return gulp.src('src/assets/**/*.+(png|gif|jpg|svg)')
		.pipe(gulp.dest('dist/assetes'))
});

// Clean dist folder
gulp.task('clean', function() {
	del('dist');
})

// Build project
gulp.task('build', function(callback) {
	runSequence('clean', ['sass', 'concat', 'images'], callback);
})