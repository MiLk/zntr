'use strict';

/*
 * Packet structure
 * - Protocol version (8 bits)
 * - Next Header (8 bits)
 *  - Header parameters
 * - Body size (16bits)
 * - Body
 */

const HEADERS = {
  0: ['end'],
  1: ['type', 1],
  2: ['message_id', 32]
};

const MESSAGE_TYPE = {
  0: 'notification',
  1: 'request',
  2: 'response'
};

function _read(stream, size) {
  var value = null;
  while(value == null) {
    value = stream.read(size);
  }
  return value;
}

function readHeaders (stream) {
  var headers = [];
  var nextHeader = stream.read(1);
  while (nextHeader != 0) {
    var header = {};
    header.opcode = nextHeader;
    header.name = HEADERS[nextHeader][0];
    header.params = [];
    let toRead = HEADERS[nextHeader].slice(1);
    for (let i = 0; i < toRead.length; ++i) {
      header.params.push(stream.read(toRead[i]));
    }
    headers.push(header);
    nextHeader = stream.read(1);
  }
  return headers;
}

function readPacket (stream) {
  var packet = {};
  packet.version = stream.read(1);
  packet.headers = readHeaders(stream);
  packet.size = stream.read(2);
  packet.body = stream.read(packet.size);
  return packet;
}

function rawProtocol (inputStream, outputStream) {

}

module.exports = rawProtocol;
