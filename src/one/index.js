'use strict'

var step = 'one'
var $ = require('jquery')
var dep = require('app/dep')

$('body').append(dep(step))
