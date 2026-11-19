// news-image-20261118 — Wednesday 18 November 2026 front page.
// The program copies the front page the repository holds (entry.png,
// 1024x1024, built as HTML/CSS and rendered to PNG) to /output/entry.png.
// It checks the file is really a PNG and that the output directory exists
// before copying, so a bad build fails loudly instead of shipping a
// truncated image. The copied bytes are the entry; the program writes
// exactly the same bytes on every run.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

// A PNG starts with its 8-byte signature; refuse anything else.
const bytes = readFileSync(source);
const header = bytes.subarray(0, 8);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!header.equals(pngSignature)) {
  throw new Error('entry.png is not a PNG file');
}

// The gate takes at most 1 MiB and 1024 by 1024 pixels; the width and
// height live in the IHDR chunk (bytes 16-23, big-endian). Refuse an
// image that would fail the gate instead of submitting it.
if (bytes.length > 1024 * 1024) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate`);
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
console.log(`copied entry.png (${statSync(target).size} bytes) to ${target}`);
