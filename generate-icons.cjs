const fs = require('fs')
const zlib = require('zlib')
const path = require('path')

function uint32BE(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n, 0)
  return b
}

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBytes, data])
  return Buffer.concat([uint32BE(data.length), typeBytes, data, uint32BE(crc32(crcInput))])
}

function createSolidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = pngChunk('IHDR', Buffer.concat([
    uint32BE(size), uint32BE(size),
    Buffer.from([8, 2, 0, 0, 0])
  ]))
  const row = Buffer.alloc(1 + size * 3)
  row[0] = 0
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r
    row[1 + x * 3 + 1] = g
    row[1 + x * 3 + 2] = b
  }
  const imageData = Buffer.concat(Array.from({ length: size }, () => row))
  const idat = pngChunk('IDAT', zlib.deflateSync(imageData))
  const iend = pngChunk('IEND', Buffer.alloc(0))
  return Buffer.concat([sig, ihdr, idat, iend])
}

const publicDir = path.join(__dirname, 'public')
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

// #3B82F6 = rgb(59, 130, 246)
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createSolidPNG(192, 59, 130, 246))
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createSolidPNG(512, 59, 130, 246))
console.log('Icons generated.')
