'use strict';

// Initialize mage
var mage = require('../');

// Require a mage internal module
var Foo = mage.require('foo');
var foo = new Foo();

// Require an application module
var Bar = mage.require('bar');
var bar = new Bar();

// TCP server
var Server = mage.require('server');
var TcpTransport = mage.require('server/transports/tcp');
var server = new Server(new TcpTransport(8001));

// Receive mage events
mage.events.on('uncaughtExeption', () => {
  if (err) {
    console.error('uncaughtExeption:', err, err.stack);
  }
});
mage.events.on('beforeExit', () => {
  console.log('Stopping the game server.');
});
