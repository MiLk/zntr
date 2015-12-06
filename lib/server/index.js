'use strict';

let MageModule = require('../../definitions/module');

class Server extends MageModule {
  constructor (transports) {
    super()

    this._transports = Array.isArray(transports) ? transports : [transports];

    for(var i = 0; i < this._transports.length; i++) {
      this._transports[i].handler = this._handle.bind(this);
    }

    this.mage.events.on('beforeExit', () => {
      console.log('Stopping the tcp server');
      this.shutdown();
    });
  }

  _handle(data) {
    return new Promise((resolve, reject) => {
      console.log('Server handler', data);
      resolve(data);
    });
  }

  shutdown() {
    return new Promise(() => {
      var promises = this._transports.map((transport) => {
        return transport.shutdown();
      });
      return Promise.all(promises);
    });
  }
}
 module.exports = Server;