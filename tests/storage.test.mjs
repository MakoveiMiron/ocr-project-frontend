import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { encodeStorageKeyForRoute } from '../lib/storage.ts';

describe('encodeStorageKeyForRoute', () => {
  const cases = [
    ['exports/test-docling.md', 'exports/test-docling.md'],
    ['exports/test docling.md', 'exports/test%20docling.md'],
    ['/exports/test-docling.raw.json', 'exports/test-docling.raw.json'],
    ['exports\\test-docling.md', 'exports/test-docling.md'],
    ['exports/folder name/test file.raw.json', 'exports/folder%20name/test%20file.raw.json']
  ];

  for (const [input, expected] of cases) {
    it(`${input} -> ${expected}`, () => {
      assert.equal(encodeStorageKeyForRoute(input), expected);
    });
  }
});
