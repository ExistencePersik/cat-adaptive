const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const del = require("del");
const ghPages = require("gulp-gh-pages");
const uglify = require("gulp-uglify");
const htmlmin = require("gulp-htmlmin");

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.mozjpeg({quality: 95, progressive: true}),
    imagemin.svgo()
    ]))
 }

exports.images = images;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// JSmin

const uglifyJS = () => {
  return gulp.src("source/js/*.js")
  .pipe(uglify())
  .pipe(gulp.dest('build/js'))
};

exports.uglifyJS = uglifyJS;


// HTMLmin

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({ collapseWhitespace: true}))
  .pipe(gulp.dest('build'))
};

exports.html = html;

// Copy

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico",
    "source/*.html"
  ], {
  base: "source"
  })
 .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  styles, server, watcher
);

// Build

var build = gulp.series(
  clean,
  copy,
  styles,
  uglifyJS,
  html,
  images
);

exports.build = build;

// GHP

gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});
