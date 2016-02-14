'use strict';

var shared = require('mage/lib/server/shared/tcp');
var rawProtocol = require('mage/lib/server/protocol/raw');
var net = require('net');
var client = net.connect({port: 8001}, function () {
  console.log('connected to server!');

  var packet = rawProtocol.createPacket('qwerty', {
    messageType: rawProtocol.MESSAGE_TYPE['notification']
  });
  client.write(packet);

  var packet2 = rawProtocol.createPacket('azerty', {
    messageType: rawProtocol.MESSAGE_TYPE['request']
  });
  client.write(packet2);
});
client.on('data', shared.createDataHandler(client, (message) => {
  console.log('Here message', message);
  client.end();
}));
client.on('end', function () {
  console.log('disconnected from server');
});
