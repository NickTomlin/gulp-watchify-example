'use strict'

var _ = require('lodash')
var gutil = require('gulp-util')
var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var rename = require('gulp-rename')
var watchify = require('watchify')
var exit = require('gulp-exit')
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

// bundle our "vendored"/external bundles
// too keep things nice and small
var vendorBundle = browserify('./src/vendor.js')
    .require(externalBundles)

// transform our source targets
// into an object that our bundle task consumes
var bundles = targets.map(function (target) {
  var path = './src/' + target + '/index.js'
  var bundle = watchify(browserify(path), watchify.args)
      .external(externalBundles)
      // tack any additional browserify transforms on here
      .transform(envify())
  return {
    target: target,
    bundle: bundle
  }
}).map(function (bundle, index) {
  // watchify will notify us when a dep changes
  // when that happens, we rebundle
  bundle.bundle.on('update', bundleIt)
  return bundle
})

function bundleIt () {
  return merge.apply(null, bundles.map(function (obj) {
    return obj.bundle
      .bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(obj.target))
      .pipe(rename({
        suffix: '.built',
        extname: '.js'
      }))
  }))
}

gulp.task('build', ['build:external'], function () {
   return bundleIt()
    .pipe(gulp.dest('dist'))
    // hack to kill watchify
    .pipe(exit())
})

gulp.task('build:watch', ['build:external'], function () {
  return bundleIt()
    .pipe(gulp.dest('dist'))
})

gulp.task('build:external', function () {
  vendorBundle
    .bundle()
    .pipe(source('vendor.js'))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', ['build:watch'])
