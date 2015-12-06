'use strict';

let MageModule = require('../../definitions/module');

class Foo extends MageModule {
  constructor () {
    super();
    this.foo = 'bar';
  }
}

module.exports = Foo;
