// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestHome, takeHomeRequest } from './home-request.ts';

test('a request is taken once', () => {
  requestHome(1000);
  assert.equal(takeHomeRequest(1200), true);
  assert.equal(takeHomeRequest(1300), false);
});

test('nothing is waiting until a request is made', () => {
  assert.equal(takeHomeRequest(5000), false);
});

test('a request nobody picked up in time expires', () => {
  requestHome(1000);
  assert.equal(takeHomeRequest(6000), false);
});
