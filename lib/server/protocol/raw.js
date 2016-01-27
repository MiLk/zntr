'use strict';

/*
 * Packet structure
 * - Protocol version (8 bits)
 * - Header size (16bits)
 * - Body size (16bits)
 * - Next Header (8 bits)
 *  - Header parameters
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

function readHeaders(buffer) {
  var headers = [];
  var offset = 5;
  var nextHeader = buffer.readInt8(offset);
  offset++;
  while (nextHeader != 0) {
    var header = {};
    header.opcode = nextHeader;
    header.name = HEADERS[nextHeader][0];
    header.params = [];
    let toRead = HEADERS[nextHeader].slice(1);
    for (let i = 0; i < toRead.length; ++i) {
      header.params.push(buffer.slice(offset, offset + toRead[i]));
      offset += toRead[i];
    }
    headers.push(header);
    nextHeader = buffer.readInt8(offset);
    offset++;
  }
  return headers;
}

function readPacketMeta(buf, packet) {
  packet.version = buf.readInt8(0);
  packet.hsize = buf.readUInt16BE(1);
  packet.bsize = buf.readUInt16BE(3);
  return packet;
}

function readPacket(buf, packet) {
  try {
    packet.headers = readHeaders(buf);
    packet.body = buf.slice(packet.hsize);
    return packet;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

var buffers = [];

function rawProtocol(inputStream, outputStream) {
  inputStream.on('data', function (data) {
    // If the last buffer is < 5B
    if (buffers[buffers.length - 1] && buffers[buffers.length - 1].length < 5) {
      // Concat the incoming data with the last buffer
      buffers[buffers.length - 1] = Buffer.concat(
        [buffers[buffers.length - 1], data],
        buffers[buffers.length - 1].length + data.length
      );
    } else {
      // Add a new buffer
      buffers.push(data);
    }

    console.log('buffers:', buffers, buffers.map((buf) => {
      return buf.length;
    }));

    var packet = {};
    if (buffers[0].length >= 5) {
      packet = readPacketMeta(buffers[0], packet);

      var totalSize = 5 + packet.hsize + packet.bsize;
      if (buffers[0].length >= totalSize) {
        packet = readPacket(buffers[0], packet);
      } else {
        var bufferSize = buffers.reduce((previous, buf) => {
          return previous + buf.length;
        }, 0);
        if (bufferSize >= totalSize) {
          buffers[0] = Buffer.concat(buffers, bufferSize);
          packet = readPacket(buffers[0], packet);
        } else {
          return;
        }
      }
      console.log('packet read:', packet);
      console.log(packet.body.toString());
    }
  });
}

module.exports = rawProtocol;
