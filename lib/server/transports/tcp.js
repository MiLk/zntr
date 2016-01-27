'use strict';

var net = require('net');
var util = require('util');
var EventEmitter = require('events');

class TcpTransport {
  constructor(port) {
    EventEmitter.call(this);
    this.connections = [];
    this.server = this._createServer();

    // Shorthand for registering a listening callback handler
    this.server.on('listening', () => {
      this.emit('listening');
    });
    this.server.listen(port);

    // Any time the server encounters an error, check it here.
    // Right now it only handles errors when trying to start the server
    this.server.on('error', (e) => {
      this.emit('error', e);
    });

    // A simple flag to make sure calling ``shutdown`` after the server has already been shutdown doesn't crash Node
    this.server.on('close', () => {
      this.emit('shutdown');
      this.notClosed = false;
    });
    this.notClosed = true;
  }

  _createServer() {
    return net.createServer((con) => {
      this.connections[JSON.stringify(con.address())] = con;
      this.emit('connection', con);
      this.handleStream(con, con);

      var onEndOrError = () => {
        delete this.connections[JSON.stringify(con.address())];
        if (!con.isClosed) {
          this.emit('closedConnection', con);
          // When the connection for a client dies, make sure the handlerCallbacks don't try to use it
          con.isClosed = true;
        }
      };
      con.on('end', onEndOrError);
      con.on('error', onEndOrError);
    });
  }

  // Overriden in the server to plug a custom protocol
  handleStream(inputStream, outputStream) {
    inputStream.pipe(outputStream);
  }

  shutdown() {
    return new Promise((resolve) => {
      if (!this.server || !this.notClosed) {
        resolve();
        return;
      }
      this.server.close(resolve);
      Object.keys(this.connections).forEach((key) => {
        var con = this.connections[key];
        con.destroy();
      });
    });
  }
}
util.inherits(TcpTransport, EventEmitter);

module.exports = TcpTransport;
