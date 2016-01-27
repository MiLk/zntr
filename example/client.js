'use strict';

var shared = require('mage/lib/server/shared/tcp');
var net = require('net');
var client = net.connect({port: 8001}, function () {
  console.log('connected to server!');
  var message = 'qwertyuiopashjklzxcvbnm';
  for (var i = 0; i < 10; ++i) {
    message += message;
  }
  var messageLen = Buffer.byteLength(message);

  var headers = new Buffer(1);
  headers.writeInt8(0, 0);

  var meta = new Buffer(5);
  meta.writeInt8(1, 0);
  meta.writeInt16BE(headers.length, 1);
  meta.writeInt16BE(messageLen, 3);

  client.write(meta);
  client.write(headers);
  client.write(new Buffer(message));
});
client.on('data', shared.createDataHandler(client, (message) => {
  console.log('Here message', message);
  client.end();
}));
client.on('end', function () {
  console.log('disconnected from server');
});
