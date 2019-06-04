import gulp from 'gulp';
import browserSync from 'browser-sync';
import del from 'del';

import sourcemaps from 'gulp-sourcemaps';

// For processing JS
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';

// For processing CSS
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';

// For processing images
import imagemin from 'gulp-imagemin';
import imageminWebp from 'imagemin-webp';
import imageminSvgo from 'imagemin-svgo';
// import imageResize from 'gulp-image-resize';
// import rename from 'gulp-rename';

const server = browserSync.create();

const paths = {
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'dist/scripts/'
  },
  styles: {
    src: 'src/styles/**/*.css',
    dest: 'dist/styles/'
  },
  html: {
    src: 'src/*.html',
    dest: 'dist/'
  },
  images: {
    src: 'src/images/**/*.{jpg, jpeg, png, svg}',
    dest: 'dist/images/'
  }
};

/**********    Build tasks    **********/

// Delete dist folder
export const clean = () => del(['dist']);

// Process and uglify js, copy to dist folder
export function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(paths.scripts.dest));
}

// Process and minify css, copy to dist folder
export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(paths.styles.dest))
}

// Copy html to dist folder
export function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest));
}


/**********    Image Handling    **********/

// Minify images and copy to build folder
export function images() {
  return gulp.src(paths.images.src, { since: gulp.lastRun(images)})
    .pipe(imagemin([
      imageminWebp({
        quality: 70  // default 75
      }),
      imageminSvgo()
    ]))
    .pipe(gulp.dest(paths.images.dest));
}


/**********    Development    **********/

// Start serving src folder
export function serve(done) {
  server.init({
    server: {
      baseDir: './src'
    }
  });
  done();
}

// Reload the server
export function reload(done) {
  server.reload();
  done();
}

// Watch files for changes and reload server
export function watch() {
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
  gulp.watch(paths.styles.src, gulp.series(styles, reload));
  gulp.watch(paths.html.src, gulp.series(html, reload));
}

// Build dist folder, start server, and watch files
const build = gulp.series(clean, gulp.parallel(scripts, styles, html, images), serve, watch);

// Set build as default task
export default build;
