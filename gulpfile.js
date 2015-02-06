'use strict'

var _ = require('lodash')
var gutil = require('gulp-util')
var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var rename = require('gulp-rename')
var watchify = require('watchify')
var envify = require('envify/custom')
var merge = require('merge-stream')

var externalBundles = [
  'jquery',
  'app/dep'
]

var targets = [
  'one',
  'two',
  'three'
]

var vendorBundle = browserify('./src/vendor.js')
    .require(externalBundles)

var bundles = targets.map(function (target) {
  var path = './src/' + target + '/index.js'
  var bundle = watchify(browserify(path), watchify.args)
      .external(externalBundles)
      .transform(envify())

  return {
    target: target,
    bundle: bundle
  }
}).map(function (bundle, index) {
  bundle.bundle.on('update', bundleIt.bind(null, bundle))

  return bundle;
});

function bundleIt (obj) {
  return obj.bundle
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(obj.target))
    .pipe(rename({
      suffix: '.built',
      extname: '.js'
    }))
    .pipe(gulp.dest('dist'))
}

gulp.task('build', function () {
  var built = bundles.map(function (bundle) {
    return bundleIt(bundle)
  })

  return merge.apply(null, built)
})

gulp.task('build:external', function () {
  vendorBundle
    .bundle()
    .pipe(source('vendor.js'))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', ['build:external', 'build']);
