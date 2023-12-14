import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
import browserSync from 'browser-sync';

import cssnano from 'gulp-cssnano';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import imagemin from 'gulp-imagemin';

import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import babel from 'gulp-babel';
import replace from 'gulp-replace';
import { deleteAsync } from 'del';

const sass = gulpSass(dartSass);
const server = browserSync.create();

const paths = {
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'dist/src/styles/',
  },
  scripts: {
    src: 'src/scripts/*.js',
    dest: 'dist/src/scripts/',
  },
  html: {
    src: '*.html',
    dest: 'dist/',
  },
  assets: {
    src: 'src/assets/**/*.{png,jpg,jpeg,gif,svg,pdf}',
    dest: 'dist/src/assets/',
  },
};

gulp.task('clean', async function () {
  const deletedPaths = await deleteAsync(['dist']);

  return deletedPaths;
});

gulp.task('styles', function () {
  return gulp
    .src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(cssnano({zindex: false}))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('scripts', function () {
  return gulp
    .src(paths.scripts.src, {
      sourcemaps: true,
    })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('html', function () {
  return gulp
    .src(['./index.html'])
    .pipe(replace('dist/src/styles', 'src/styles'))
    .pipe(replace('dist/src/scripts', 'src/scripts'))
    .pipe(gulp.dest(paths.html.dest));
});

gulp.task('serve', function () {
  server.init({
    server: '.',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch(paths.styles.src, gulp.series('styles')).on('change', server.reload);
  gulp.watch(paths.scripts.src, gulp.series('scripts')).on('change', server.reload);
  gulp.watch(paths.html.src, gulp.series('html')).on('change', server.reload);
});

gulp.task('assets', function () {
  return gulp
    .src(paths.assets.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.assets.dest));
});

export const start = gulp.task(
  'default',
  gulp.series('clean', gulp.parallel('styles', 'scripts', 'assets'), 'serve'),
);

export const build = gulp.task(
  'build',
  gulp.series('clean', gulp.parallel('styles', 'scripts', 'assets', 'html')),
);

gulp.task('deploy', function () {
  return gulp.src('./dist/**/*').pipe(ghPages());
});

export default build;
