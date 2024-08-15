import path from 'path';
import gulp from 'gulp';
import watchify from 'watchify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import minify from 'gulp-minify';
import sourcemaps from 'gulp-sourcemaps';
import debug from 'gulp-debug';
import log from 'gulplog';
import extend from 'extend';
import browserSync from 'browser-sync';
import es from 'event-stream';
import htmlreplace from 'gulp-html-replace';
import insert from 'gulp-insert';
import { exec } from 'child_process';

let baseDir = 'build';
let dist = false;

if (process.env.ENV == 'dist') {
  distEnv();
}

function distEnv() {
  dist = true;
  baseDir = 'dist';
}

function copy(...args) {
  const tasks = args.map(cp =>
    gulp.src(cp.src)
      .pipe(debug({ title: ' writing', showCount: false }))
      .pipe(gulp.dest(cp.dest))
      .on('error', function (e) {
        throw e;
      })
  );
  return es.merge(tasks)
    .on('error', function (e) {
      throw e;
    });
}

gulp.task('dist-env', function (callback) {
  distEnv();
  callback();
});

gulp.task('static-fs', function(callback) {
  exec('node ./static-fs-make.cjs', function(err, stdout, stderr) {
    if (err) {
      console.error(err);
    }
    callback(err);
  });
});

gulp.task('scripts', gulp.series('static-fs', function() {
  return processScripts({
    watchify: false,
    minify: dist,
    dest: `${baseDir}/js`
  });
}));

gulp.task('copy', function () {
  return copy({
    src: './src/index.html',
    dest: `./${baseDir}/`
  });
});

gulp.task('wrap', gulp.series('scripts', function () {
  const inFile = path.join(baseDir, `js/mrz-worker.bundle${dist ? '-min' : ''}.js`);
  return gulp.src(inFile)
    .pipe(insert.wrap('function mrz_worker(){\n', '\n}'))
    .pipe(rename({
      dirname: '',
      extname: '-wrapped.js'
    }))
    .pipe(debug({ title: ' writing', showCount: false }))
    .pipe(gulp.dest(`${baseDir}/js`))
    .on('error', function (err) {
      log.info(err);
    });
}));

gulp.task('htmlreplace', gulp.series('copy', function () {
  return gulp.src(`${baseDir}/index.html`)
    .pipe(htmlreplace({
      js: {
        src: null,
        tpl: [
          `<script src="js/mrz-worker.bundle${dist ? '-min' : ''}-wrapped.js"></script>`,
          `<script src="js/demo.bundle${dist ? '-min' : ''}.js"></script>`
        ].join('\n')
      }
    }))
    .pipe(gulp.dest(`./${baseDir}/`));
}));

gulp.task('build', gulp.series('scripts', 'wrap', 'copy', 'htmlreplace'));

gulp.task('dist', gulp.series('dist-env', 'build'));

gulp.task('watch', function () {
  gulp.watch('./src/index.html', gulp.series('htmlreplace'));
  return processScripts({
    justWatch: true,
    minify: dist,
    dest: `./${baseDir}/js`
  });
});

gulp.task('serve', function () {
  browserSync.init([`${baseDir}/**`], {
    watchOptions: {
      ignoreInitial: true
    },
    server: {
      baseDir: baseDir
    },
    https: false
  });
});

gulp.task('default', gulp.series('build', 'watch', function (done) {
  gulp.start('serve');
  done();
}));

function processScripts(options = {}) {
  const files = [
    'src/demo.js',
    'src/mrz-worker.js'
  ];

  const _watchify_enabled = options.watchify === true || options.justWatch === true;
  const _watchify = _watchify_enabled ? watchify : b => b;

  const tasks = files.map(filename => {
    const b = _watchify(browserify(extend(true, {},
      watchify.args,
      {
        debug: true
      }
    )))
      .add(filename)
      .on('update', bundle)
      .on('log', log.info);

    function bundle() {
      let stream = b
        .bundle()
        .on('error', function (err) {
          console.error(err);
          this.emit('end');
        })
        .on('log', log.info)
        .pipe(source(filename))
        .pipe(buffer())
        .pipe(rename({
          dirname: '',
          extname: '.bundle.js'
        }))
        .pipe(sourcemaps.init({ loadMaps: true }));

      if (options.minify) {
        stream = stream.pipe(minify())
          .on('error', function (err) {
            console.error(err);
          });
      }

      return stream.pipe(sourcemaps.write('./'))
        .pipe(debug({ title: ' writing', showCount: false }))
        .pipe(gulp.dest(options.dest));
    }

    return options.justWatch ? b.bundle() : bundle();

  });
  return es.merge.apply(null, tasks);
}
