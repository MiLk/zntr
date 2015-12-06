'use strict';

module.exports = class {
  constructor () {
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
