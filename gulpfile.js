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
  images: {
    src: 'src/images/**/*.{png,jpg,jpeg,gif,svg}',
    dest: 'dist/src/images/',
  },
  files: {
    src: 'src/files/**/*.pdf',
    dest: 'dist/src/files/',
  },
};

gulp.task('clean', async function () {
  const deletedPaths = await deleteAsync(['dist']);

  return deletedPaths;
});

const gulpStyles = gulp.task('styles', function () {
  return gulp
    .src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(cssnano({zindex: false}))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest(paths.styles.dest));
});

const gulpScripts = gulp.task('scripts', function () {
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

gulp.task('images', function () {
  return gulp
    .src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('files', function () {
  return gulp.src(paths.files.src).pipe(gulp.dest(paths.files.dest));
});

export const start = gulp.task(
  'default',
  gulp.series('clean', gulp.parallel('styles', 'scripts', 'images'), 'serve'),
);

export const build = gulp.task(
  'build',
  gulp.series('clean', gulp.parallel('styles', 'scripts', 'images', 'files', 'html')),
);

gulp.task('deploy', function () {
  return gulp.src('./dist/**/*').pipe(ghPages());
});

export default build;
