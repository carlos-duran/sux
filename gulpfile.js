const read = require('fs').readFileSync
const join = require('path').join
const gulp = require('gulp')
const rename = require('gulp-rename')
const gutil = require('gulp-util')
const notify = require('gulp-notify')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const pug = require('gulp-pug')
const browserSync = require('browser-sync').create()

const lib = {
  scss: {
    src: 'src/lib/sux.scss',
    dest: 'dist',
    watch: 'src/lib/**/*.scss'
  },
  css: {
    src: 'dist/sux.css',
    dest: 'dist'
  }
}

const docs = {
  pug: {
    src: 'src/docs/views/**/!(layout).pug',
    dest: 'docs',
    watch: 'src/docs/**/*.pug'
  },
  scss: {
    src: 'src/docs/styles/docs.scss',
    dest: 'docs/css',
    watch: 'src/docs/styles/**/*.scss'
  },
  css: {
    src: 'docs/css/docs.css',
    dest: 'docs/css'
  }
}

// Lib

gulp.task('lib:scss', () => {
  return gulp.src(lib.scss.src)
    .pipe(sass()
      .on('error', sass.logError)
      .on('error', notify.onError('Scss error'))
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest(lib.scss.dest))
    .pipe(gulp.dest(docs.scss.dest)) // docs
    .pipe(browserSync.stream())
})

gulp.task('lib:scss:watch', ['lib:scss'], () => {
  gulp.watch(lib.scss.watch, ['lib:scss'])
})

gulp.task('lib:css', () => {
  return gulp.src(lib.css.src)
    .pipe(cleanCSS({ level: { 2: { restructureRules: true } } }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(lib.css.dest))
    .pipe(gulp.dest(docs.css.dest))  // docs
})

gulp.task('lib:watch', ['lib:scss:watch'])
gulp.task('lib', ['lib:scss', 'lib:css'])

// Docs

function readDemo (name) {
  try {
    return read(join(__dirname, `src/docs/demos/${name}.html`), 'utf8')
  } catch (e) {
    console.log('Archivo ' + name + ' no encontrado.')
    return ''
  }
}

function docsPug (data) {
  Object.assign(data, { readDemo })
  return gulp.src(docs.pug.src)
    .pipe(pug({ pretty: true, data }).on('error', gutil.log))
    .pipe(gulp.dest(docs.pug.dest))
}

gulp.task('docs:pug:dev', () => {
  return docsPug({ prod: false })
})

gulp.task('docs:pug', () => {
  return docsPug({ prod: true })
})

gulp.task('docs:pug:watch', ['docs:pug:dev'], () => {
  gulp.watch(docs.pug.watch, ['docs:pug:dev'])
})

gulp.task('docs:scss', () => {
  return gulp.src(docs.scss.src)
    .pipe(sass()
      .on('error', sass.logError)
      .on('error', notify.onError('Scss error'))
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest(docs.scss.dest))
    .pipe(browserSync.stream())
})

gulp.task('docs:scss:watch', ['docs:scss'], () => {
  gulp.watch(docs.scss.watch, ['docs:scss'])
})

gulp.task('docs:css', () => {
  return gulp.src(docs.css.src)
    .pipe(cleanCSS({ level: { 2: { restructureRules: true } } }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(docs.css.dest))
})

gulp.task('docs:watch', ['docs:pug:watch', 'docs:scss:watch'])
gulp.task('docs', ['docs:pug', 'docs:scss', 'docs:css'], () => {})

// All

gulp.task('watch', ['lib:watch', 'docs:watch'], () => {
  browserSync.init({ server: './docs', port: 3000, notify: false })
  gulp.watch('docs/**/*.html').on('change', browserSync.reload)
  gulp.src('gulpfile.js').pipe(notify('Watching sources'))
})

gulp.task('default', ['lib', 'docs'], () => {
  gulp.src('gulpfile.js').pipe(notify('Production build done'))
})
