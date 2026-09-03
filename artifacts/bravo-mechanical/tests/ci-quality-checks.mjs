#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = await readFile(path.resolve(root, '..', '..', '.github', 'workflows', 'quality-checks.yml'), 'utf8');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

const orderedCommands = [
  'PORT=4174 pnpm --filter @workspace/bravo-mechanical run test',
  'pnpm run typecheck',
  'pnpm --filter @workspace/bravo-mechanical run audit:local-content',
  'pnpm --filter @workspace/bravo-mechanical run test:local-content',
  'PORT=4174 pnpm run build',
  'pnpm --filter @workspace/bravo-mechanical run test:e2e',
  'pnpm --filter @workspace/bravo-mechanical run test:local-pages',
  'PORT=4174 pnpm --filter @workspace/bravo-mechanical run test:local-parity',
  'pnpm --filter @workspace/bravo-mechanical run test:bundle',
  'pnpm --filter @workspace/bravo-mechanical run test:ci-config',
];

let previousIndex = -1;
for (const command of orderedCommands) {
  const index = workflow.indexOf(`run: ${command}`);
  assert(index >= 0, `quality-checks.yml is missing the exact acceptance command: ${command}`);
  assert(index > previousIndex, `quality-checks.yml runs acceptance commands out of order at: ${command}`);
  previousIndex = index;
}

assert.equal(packageJson.scripts['test:local-pages'], 'node tests/local-landing-pages.mjs');
assert.equal(packageJson.scripts['test:local-parity'], 'vitest run src/test/local-page-react-parity.test.tsx');
assert.equal(packageJson.scripts['test:bundle'], 'node tests/bundle-boundary.mjs');
assert.equal(packageJson.scripts['test:ci-config'], 'node tests/ci-quality-checks.mjs');

console.log(`CI quality gate checks passed for ${orderedCommands.length} ordered acceptance commands.`);
