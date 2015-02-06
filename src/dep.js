'use strict';

module.exports = function (phrase) {
  var el = document.createElement('p')
  el.textContent = 'dep called by:' + phrase + ' built by user: ' + process.env.USER;
  return el;
}
