'use strict';

var shared = require('mage/lib/server/shared/tcp');
var net = require('net');
var client = net.connect({port: 8001}, function () {
  console.log('connected to server!');
  client.write(shared.formatMessage({'foo': 'bar'}));
});
client.on('data', shared.createDataHandler(client, (message) => {
  console.log('Here message', message);
  client.end();
}));
client.on('end', function () {
  console.log('disconnected from server');
});
