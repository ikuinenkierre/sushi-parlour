	'use strict';

	const { src, dest, parallel, series, watch } = require('gulp');
	const browserSync  = require('browser-sync').create();
	const plumber	   = require('gulp-plumber');
	const concat	   = require('gulp-concat');
	const minify	   = require('gulp-csso');
	const uglify	   = require('gulp-uglify-es').default;
	const sass         = require('gulp-sass');
	const less         = require('gulp-less');
	const autoprefixer = require('gulp-autoprefixer');
	const cleancss     = require('gulp-clean-css');
	const imagemin     = require('gulp-imagemin');
	const webp		   = require('imagemin-webp');
	const extReplace   = require('gulp-ext-replace');
	const rename	   = require('gulp-rename');
	const svgstore	   = require('gulp-svgstore');
	const posthtml 	   = require('gulp-posthtml');
	const include 	   = require('posthtml-include');
	const newer        = require('gulp-newer');
	const del          = require('del');

	function browsersync() {
		browserSync.init({
			server: {baseDir: 'dist/'},
			notify: false,
			online: true
		});
		// done();
	}

	function browserSyncReload() {
  		browserSync.reload();
  		// done();
	}

	function scripts() {
		return src([
			'node_modules/jquery/dist/jquery.min.js',
			'src/js/scripts.js'
		])
		.pipe(plumber())
		.pipe(uglify())
		.pipe(dest('dist/js/'))
		.pipe(browserSync.stream())
	}

	function styles() {
		return src('src/sass/main.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(dest('dist/css/'))
		.pipe(cleancss({ level: { 1: { specialComments: 0 }}, /*format: 'beautify'*/}))
		.pipe(rename('main.min.css'))
		.pipe(dest('dist/css/'))
		.pipe(browserSync.stream())
	}

	function images() {
		return src('src/images/src/**/*')
		.pipe(newer('dist/images/'))
		.pipe(imagemin([
			imagemin.optipng({ optimizationLevel: 3 }),
            imagemin.mozjpeg({ progressive: true }),
            imagemin.svgo()
		]))
		.pipe(dest('dist/images/'))
	}

	function imgwebp() {
		return src('src/images/**/*')
		.pipe(imagemin([
			webp({ quality: 90 })
		]))
		.pipe(extReplace('.webp'))
		.pipe(dest('dist/images/'))
	}

	function sprite() {
		return src('src/images/icon-*.svg')
		.pipe(svgstore({ inlineSvg: true }))
		.pipe(rename('sprite.svg'))
		.pipe(dest('dist/images/'))
	}

	function html() {
		return src('src/*.html')
		.pipe(posthtml([
			include()
		]))
		.pipe(dest('dist/'))
		.pipe(browserSync.stream())
	}


	// function cleanimg() {
	// 	return del('src/images/dest/**/*', { force: true })
	// }

	function cleandist() {
		return del('dist/**/*', { force: true })
	}

	function buildcopy() {
		return src([
			'src/fonts/**/*',
			'src/css/**/*.min.css',
			'src/js/**/*.min.js',
			'src/images/**/*',
			'src/**/*.html'
			], { base: 'src'})
		.pipe(dest('dist'))
	}

	function startWatch() {
		watch('src/**/*.scss', styles);
		watch(['src/**/*.js', '!src/**/*.min.js'], scripts);
		watch('src/**/*.html'/*).on('change', browserSyncReload);*/, html);
		watch('src/images/**/*', images);
	}

	const build = series(cleandist,  sprite, buildcopy, parallel(styles, scripts, images, imgwebp, html));
	const Watch = parallel(startWatch, browsersync);
	const dev = series(build, Watch);

  	exports.browsersync = browsersync;
  	exports.scripts		= scripts;
  	exports.styles      = styles;
  	exports.images      = images;
  	// exports.cleanimg	= cleanimg;
  	exports.imgwebp		= imgwebp;
	exports.build 		= build;
  	exports.watch 		= Watch;
  	

  	exports.default     = dev;