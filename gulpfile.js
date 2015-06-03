// Import
var gulp = require('gulp');
var del = require('del');
var util = require('gulp-util');
var changed = require('gulp-changed');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

// Main Tasks

gulp.task('default', ['staticsvr'], function () {
	livereload.listen();
	gulp.watch('./views/*', ['local-views', 'reload']);
	gulp.watch('./style/**/*.scss', ['local-style', 'reload']);
	gulp.watch('./script/**/*', ['local-script', 'reload']);
	gulp.watch('./data/**/*', ['local-data', 'reload']);
	gulp.watch('./assets/**/*', ['local-assets', 'reload']);
	gulp.watch('./vendor/**/*', ['local-vendor', 'reload']);
});

gulp.task('reset', ['clean-local'], function () {
	util.log('Reseting local development environment.');
	resetLocal();
	return true;
});

gulp.task('prod', ['clean-prod'], function () {
	return gulp.src('./.local/**/*')
		.pipe(gulp.dest('./prod'));
});

// Local Tasks

gulp.task('local-views', function () {
	return gulp.src('./views/*')
		.pipe(changed('./.local/'))
		.pipe(gulp.dest('./.local/'));
});

gulp.task('local-data', function () {
	return gulp.src('./data/**/*')
		.pipe(changed('./.local/data/'))
		.pipe(gulp.dest('./.local/data/'));
});

gulp.task('local-assets', function () {
	return gulp.src('./assets/**/*')
		.pipe(changed('./.local/assets/'))
		.pipe(gulp.dest('./.local/assets/'));
});

gulp.task('local-vendor', function () {
	return gulp.src('./vendor/**/*')
		.pipe(changed('./.local/vendor/'))
		.pipe(gulp.dest('./.local/vendor/'));
});

gulp.task('local-style', function () {
	return gulp.src('./style/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded',
			onError: function (err) {
				var file = err.file.substring(process.cwd().length + 6);
				var message = util.colors.magenta('Sass Error') + ': ' + file + '::';
				message += util.colors.magenta(err.line + ':' + err.column) + ' -> ';
				message += util.colors.cyan(err.message) + ' code: ' + err.code;
				util.log(message);
			}
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./.local/style/'));
});

gulp.task('local-script', function () {
	return gulp.src('./script/**/*')
		.pipe(changed('./.local/script/'))
		.pipe(gulp.dest('./.local/script'));
});

// Reset Tasks

gulp.task('clean-local', function (cb) {
	del(['./.local'], cb);
});

gulp.task('clean-prod', function (cb) {
	del(['./prod'], cb);
});

var resetLocal = function () {
	gulp.src('./views/*')
		.pipe(gulp.dest('./.local/'));
	gulp.src('./style/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./.local/style/'));
	gulp.src(['./script/**/*'])
		.pipe(gulp.dest('./.local/script/'));
	gulp.src(['./data/**/*'])
		.pipe(gulp.dest('./.local/data/'));
	gulp.src(['./vendor/**/*'])
		.pipe(gulp.dest('./.local/vendor/'));
	gulp.src(['./assets/**/*'])
		.pipe(gulp.dest('./.local/assets/'));
	return true;
};

// Sever and Reload Tasks

gulp.task('reload', function () {
	gulp.src('./.local').pipe(livereload());
});

gulp.task('staticsvr', function (next) {
	var staticS = require('node-static');
	var server = new staticS.Server('./.local');
	var port = 3773;

	require('http').createServer(function (request, response) {
		request.addListener('end', function () {
			server.serve(request, response);
		}).resume();
	}).listen(port, function () {
		util.log('Server listening on port: ' + util.colors.magenta(port));
		next();
	});
});