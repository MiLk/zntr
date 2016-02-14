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

const MESSAGE_TYPE_REVERSED = {
  'notification': 0,
  'request': 1,
  'response': 2
};

const READ_FUNCTIONS = {
  1: 'readUInt8',
  2: 'readUInt16BE',
  4: 'readUInt32BE'
};

const WRITE_FUNCTIONS = {
  1: 'writeUInt8',
  2: 'writeUInt16BE',
  4: 'writeUInt32BE'
};


function readHeaders(buffer) {
  var headers = [];
  var offset = 5;
  var nextHeader = buffer.readUInt8(offset);
  offset++;
  while (nextHeader != 0) {
    var header = {};
    header.opcode = nextHeader;
    header.name = HEADERS[nextHeader][0];
    header.params = [];
    let toRead = HEADERS[nextHeader].slice(1);
    for (let i = 0; i < toRead.length; ++i) {
      header.params.push(buffer[READ_FUNCTIONS[toRead[i]]](offset));
      console.log(buffer, header);
      offset += toRead[i];
    }
    headers.push(header);
    nextHeader = buffer.readUInt8(offset);
    offset++;
  }
  return headers;
}

function readPacketMeta(buf, packet) {
  packet.version = buf.readUInt8(0);
  packet.hsize = buf.readUInt16BE(1);
  packet.bsize = buf.readUInt16BE(3);
  return packet;
}

function readPacket(buf, packet) {
  try {
    packet.headers = readHeaders(buf);
    packet.body = buf.slice(packet.hsize + 5);
    return packet;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

var buffers = [];

function rawProtocolParser(inputStream) {
  inputStream.on('data', (data) => {
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

    var packet = {};
    if (buffers[0].length >= 5) {
      packet = readPacketMeta(buffers[0], packet);

      var totalSize = 5 + packet.hsize + packet.bsize;
      if (buffers[0].length >= totalSize) {
        // If we have enough data in the first buffer, read it
        packet = readPacket(buffers[0], packet);
      } else {
        // Check the cumulated size of all the buffers
        var bufferSize = buffers.reduce((previous, buf) => {
          return previous + buf.length;
        }, 0);
        if (bufferSize >= totalSize) {
          // If we have enough data, concat the buffers
          buffers[0] = Buffer.concat(buffers, bufferSize);
          // Read the resulting buffer
          packet = readPacket(buffers[0], packet);
        } else {
          // Wait for more data
          return;
        }
      }
      if (buffers[0] == totalSize) {
        buffers.shift(1);
      } else {
        buffers[0] = buffers[0].slice(totalSize);
      }
      this.emit('packet', packet);
    }
  });
}

function createPacket(message, options) {
  var bMessage = new Buffer(message);

  var headers = [];
  if (options.messageType !== undefined) {
    if (MESSAGE_TYPE.hasOwnProperty(options.messageType)) {
      headers.push({
        id: 1,
        params: [{
          size: 1,
          value: options.messageType
        }]
      });
    }
  }

  var headersSize = headers.length + 1;
  headers.forEach(function (header) {
    header.params.forEach(function (param) {
      headersSize += param.size;
    });
  });
  var bHeaders = new Buffer(headersSize);
  var offset = 0;
  headers.forEach(function (header) {
    bHeaders.writeUInt8(header.id, offset++);
    header.params.forEach(function (param) {
      bHeaders[WRITE_FUNCTIONS[param.size]](param.value, offset++);
    });
  });
  // Write end
  bHeaders.writeUInt8(0, offset);

  var meta = new Buffer(5);
  // Protocol version
  meta.writeUInt8(1, 0);
  // Header size
  meta.writeUInt16BE(bHeaders.length, 1);
  // Body Size
  meta.writeUInt16BE(bMessage.length, 3);

  return Buffer.concat([meta, bHeaders, bMessage], meta.length + bHeaders.length + bMessage.length);
}

module.exports = {
  parser: rawProtocolParser,
  createPacket: createPacket,
  MESSAGE_TYPE: MESSAGE_TYPE_REVERSED
};
