#!/usr/bin/env node
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'dist', 'public', 'assets');
const files = await readdir(assets);
const serviceEntries = files.filter((file) => /^ServiceDetail-[\w-]+\.js$/.test(file));
assert.equal(serviceEntries.length, 1, `expected one ServiceDetail asset, found ${serviceEntries.length}`);

const visited = new Set();
async function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const source = await readFile(path.join(assets, file), 'utf8');
  for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*)["']\.\/([^"']+\.js)["']/g)) {
    if (files.includes(match[1])) await visit(match[1]);
  }
}

await visit(serviceEntries[0]);
assert(
  ![...visited].some((file) => file.startsWith('localLandingContent-')),
  `ServiceDetail dependency graph includes the full local editorial chunk: ${[...visited].join(', ')}`,
);

const serviceSource = await readFile(path.join(assets, serviceEntries[0]));
const raw = serviceSource.byteLength;
const gzip = gzipSync(serviceSource).byteLength;
const compactEntries = files.filter((file) => /^localServiceLinks-[\w-]+\.js$/.test(file));
assert.equal(compactEntries.length, 1, `expected one compact local-service link asset, found ${compactEntries.length}`);
const compactSource = await readFile(path.join(assets, compactEntries[0]));
const compactRaw = compactSource.byteLength;
const compactGzip = gzipSync(compactSource).byteLength;
assert(compactRaw < 5_000 && compactGzip < 1_000, `compact local-service link asset is unexpectedly large: ${compactRaw} raw / ${compactGzip} gzip`);
console.log(`Bundle boundary passed: ${serviceEntries[0]} ${raw} raw / ${gzip} gzip; compact links ${compactRaw} raw / ${compactGzip} gzip replace the 217642 raw / 39703 gzip editorial baseline; full editorial chunk absent from ${visited.size}-asset static dependency graph.`);
