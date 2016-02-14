'use strict';

var util = require('util');
var EventEmitter = require('events');

class MageModule {
  constructor () {
    EventEmitter.call(this);
    this.mage = this._findMage(module);
  }

  _findMage (module) {
    if (module.exports.constructor.name === 'Mage') {
      return module.exports;
    }
    if (module.parent === null) {
      return null;
    }
    return this._findMage(module.parent);
  }
}
util.inherits(MageModule, EventEmitter);

module.exports = MageModule;
