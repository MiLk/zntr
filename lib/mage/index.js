'use strict';

var path = require('path');
var fs = require('fs');
var errors = require('./errors');
var EventEmitter = require('events');

class ModuleInfo {
  constructor(basePath, name) {
    this.basePath = basePath;
    this.name = name;
    this._module = null;
  }
  isLoaded () {
    return this._module !== null;
  }
  get module () {
    if (!this.isLoaded()) {
      this._module = require(path.join(this.basePath, this.name));
    }
    return this._module;
  }
}

class Mage {
  constructor() {
    this._modulePaths = [];
    this._modulesList = new Map();

    let magePath = path.join(__dirname, '..', '..');
    this._modulePaths.push(path.join(magePath, 'lib'));

    let appPath = path.dirname(process.mainModule.filename);
    this._modulePaths.push(path.join(appPath, 'lib'));

    this.events = new EventEmitter();

    // Delay the init, so that modules have access to mage
    setImmediate(this._init.bind(this));
  }

  _init () {
    this.require('processManager');
  }

  _register(basePath, name) {
    if (this._modulesList.has(name)) {
      // This module is already loaded
      if (this._modulesList.get(name).basePath === basePath) {
        return;
      }
      // A module is already registered with the same name
      throw new errors.MageError('A different module named ' + name + ' is already registered.');
    }
    this._modulesList.set(name, new ModuleInfo(basePath, name));
  }

  require(name) {
    if (name === 'mage') {
      return this;
    }

    if (this._modulesList.has(name)) {
      return this._modulesList.get(name).module;
    }

    for (let i = 0; i < this._modulePaths.length; ++i) {
      let resolved = path.resolve(path.join(this._modulePaths[i], name));
      if (fs.existsSync(resolved) || fs.existsSync(resolved + '.js')) {
        this._register(this._modulePaths[i], name);
        return this._modulesList.get(name).module;
      }
    }

    throw new errors.MageError('Cannot find module ' + name);
  }
}

module.exports = new Mage();
