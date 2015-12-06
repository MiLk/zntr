'use strict';

let MageModule = require('mage/definitions/module');

class Bar extends MageModule {
  constructor () {
    super();
    this.bar = 'baz';
  }
}

module.exports = Bar;
