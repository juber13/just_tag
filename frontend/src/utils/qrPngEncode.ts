import pako from 'pako';
import { PROFILE_QR_BACKGROUND, PROFILE_QR_MARGIN, PROFILE_QR_SIZE } from './qrConstants';
import { createQrMatrix } from './qrMatrix';
import { isFinderModule, isStyledModulePixel } from './qrStyle';

type Rgb = { r: number; g: number; b: number };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeU32BE(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, false);
}

function createChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  writeU32BE(view, 0, data.length);
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  chunk.set(data, 8);
  writeU32BE(view, 8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
  return chunk;
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function parseHexColor(hex: string): Rgb {
  const normalized = hex.replace('#', '').trim();
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized.slice(0, 6);
  const parsed = Number.parseInt(value, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function renderMatrixToRgba(
  matrix: boolean[][],
  outputSize: number,
  marginModules: number,
  dark: Rgb,
  light: Rgb,
): Uint8Array {
  const moduleCount = matrix.length;
  const totalModules = moduleCount + marginModules * 2;
  const rgba = new Uint8Array(outputSize * outputSize * 4);

  for (let y = 0; y < outputSize; y++) {
    for (let x = 0; x < outputSize; x++) {
      const pixelModuleX = (x / outputSize) * totalModules - marginModules;
      const pixelModuleY = (y / outputSize) * totalModules - marginModules;
      const moduleX = Math.floor(pixelModuleX);
      const moduleY = Math.floor(pixelModuleY);
      const inBounds =
        moduleX >= 0 &&
        moduleY >= 0 &&
        moduleX < moduleCount &&
        moduleY < moduleCount;
      const moduleFilled = inBounds && matrix[moduleY][moduleX];

      let filled = false;
      if (moduleFilled) {
        const localX = pixelModuleX - moduleX;
        const localY = pixelModuleY - moduleY;
        filled = isStyledModulePixel(
          localX,
          localY,
          isFinderModule(moduleX, moduleY, moduleCount),
        );
      }

      const color = filled ? dark : light;
      const offset = (y * outputSize + x) * 4;
      rgba[offset] = color.r;
      rgba[offset + 1] = color.g;
      rgba[offset + 2] = color.b;
      rgba[offset + 3] = 255;
    }
  }

  return rgba;
}

function rgbaToPngBytes(rgba: Uint8Array, width: number, height: number): Uint8Array {
  const rowSize = 1 + width * 3;
  const raw = new Uint8Array(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const rgbaOffset = (y * width + x) * 4;
      const rgbOffset = rowStart + 1 + x * 3;
      raw[rgbOffset] = rgba[rgbaOffset];
      raw[rgbOffset + 1] = rgba[rgbaOffset + 1];
      raw[rgbOffset + 2] = rgba[rgbaOffset + 2];
    }
  }

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  writeU32BE(ihdrView, 0, width);
  writeU32BE(ihdrView, 4, height);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const chunks = [
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', pako.deflate(raw)),
    createChunk('IEND', new Uint8Array(0)),
  ];

  return concatChunks(chunks);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function createProfileQrPngBase64(
  value: string,
  options: {
    size?: number;
    margin?: number;
    color?: string;
    backgroundColor?: string;
  } = {},
): string {
  const size = options.size ?? PROFILE_QR_SIZE;
  const margin = options.margin ?? PROFILE_QR_MARGIN;
  const matrix = createQrMatrix(value);
  const rgba = renderMatrixToRgba(
    matrix,
    size,
    margin,
    parseHexColor(options.color ?? '#000000'),
    parseHexColor(options.backgroundColor ?? PROFILE_QR_BACKGROUND),
  );
  return bytesToBase64(rgbaToPngBytes(rgba, size, size));
}
