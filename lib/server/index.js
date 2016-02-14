'use strict';

let MageModule = require('../../definitions/module');

class Server extends MageModule {
  constructor(options) {
    super()

    if (options.transports) {
      this._transports = Array.isArray(options.transports) ? options.transports : [options.transports];
    } else {
      let TcpTransport = require('./transports/tcp');
      this._transports = [new TcpTransport(options.port || 8000)];
    }

    this._protocol = options.protocol || require('./protocol/raw');

    for (var i = 0; i < this._transports.length; i++) {
      this._transports[i].handleStream = this._protocol.parser.bind(this);
    }

    this.mage.events.on('beforeExit', () => {
      console.log('Stopping the tcp server');
      this.shutdown();
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
