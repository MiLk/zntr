'use strict';

let MageModule = require('../../definitions/module');

class ProcessManager extends MageModule {
  constructor() {
    super()
    process.on('SIGINT', () => {
      this.mage.events.emit('SIGINT');
      this.mage.events.emit('beforeExit', undefined);
    });
    process.on('uncaughtException', (err) => {
      this.mage.events.emit('uncaughtException', err);
      this.mage.events.emit('beforeExit', err);
    });
  }
}

module.exports = new ProcessManager();