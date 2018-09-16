/**
 * @license
 * Copyright (c) 2018, General Electric
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const gulp = require('gulp');
const pkg = require('./package.json');
const $ = require('gulp-load-plugins')();
const gulpSequence = require('gulp-sequence');
const importOnce = require('node-sass-import-once');
const stylemod = require('gulp-style-modules');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const combiner = require('stream-combiner2');
const bump = require('gulp-bump');
const argv = require('yargs').argv;
const eslint = require('gulp-eslint');
const htmlExtract = require('gulp-html-extract');
const stylelint = require('gulp-stylelint');
const cache = require('gulp-cached');
const exec = require('child_process').exec;
const {ensureLicense} = require('ensure-px-license');

const sassOptions = {
  importer: importOnce,
  importOnce: {
    index: true,
    bower: true
  }
};

gulp.task('lint', ['lint:js', 'lint:html', 'lint:css']);

gulp.task('lint:js', function() {
  return gulp.src([
    '*.js',
    'test/**/*.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError('fail'));
});

gulp.task('lint:html', function() {
  return gulp.src([
    '*.html',
    'demo/**/*.html',
    'test/**/*.html'
  ])
    .pipe(htmlExtract({
      sel: 'script, code-example code',
      strip: true
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError('fail'));
});

gulp.task('lint:css', function() {
  return gulp.src([
    '*.html',
    'demo/**/*.html',
    'test/**/*.html'
  ])
    .pipe(htmlExtract({
      sel: 'style'
    }))
    .pipe(stylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});

gulp.task('clean', function() {
  return gulp.src(['.tmp', 'css'], {
    read: false
  }).pipe($.clean());
});

function handleError(err) {
  console.log(err.toString()); // eslint-disable-line
  this.emit('end'); // eslint-disable-line
}

function buildCSS() {
  return combiner.obj([
    $.sass(sassOptions),
    $.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false,
      flexbox: false
    }),
    gulpif(!argv.debug, $.cssmin())
  ]).on('error', handleError);
}

gulp.task('sass', function() {
  return gulp.src(['./sass/*.scss'])
    .pipe(cache('sassing'))
    .pipe(buildCSS())
    .pipe(stylemod({
      moduleId: function(file) {
        return path.basename(file.path, path.extname(file.path)) + '-styles';
      }
    }))
    .pipe(ensureLicense())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream({match: 'css/*.html'}));
});


gulp.task('generate-api', function(cb) {

  exec(`node_modules/.bin/polymer analyze ${pkg.name}.html > ${pkg.name}-api.json`, function(err, stdout, stderr) {
    stdout && console.log(stdout); // eslint-disable-line
    stderr && console.log(stderr); // eslint-disable-line

    exec(`node_modules/.bin/polymer analyze px-data-grid-paginated.html > px-data-grid-paginated-api.json`, function(err, stdout, stderr) {
      stdout && console.log(stdout); // eslint-disable-line
      stderr && console.log(stderr); // eslint-disable-line
      cb(err);
    });
  });
});

gulp.task('watch', function() {
  gulp.watch(['sass/*.scss'], ['sass']);
});

gulp.task('serve', function() {
  browserSync.init({
    port: 8080,
    notify: false,
    reloadOnRestart: true,
    logPrefix: `${pkg.name}`,
    https: false,
    server: ['./', 'bower_components'],
  });

  gulp.watch(['css/*-styles.html', '*.html', '*.js', 'demo/*.html']).on('change', browserSync.reload);
  gulp.watch(['sass/*.scss'], ['sass']);

});

gulp.task('bump:patch', function() {
  gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump:minor', function() {
  gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump:major', function() {
  gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('license', function() {
  return gulp.src(['./**/*.{html,js,css,scss}', '!./node_modules/**/*', '!./bower_components?(-1.x)/**/*'])
    .pipe(ensureLicense())
    .pipe(gulp.dest('.'));
});

gulp.task('default', function(callback) {
  gulpSequence('clean', 'sass', 'lint', 'license', 'generate-api')(callback);
});
