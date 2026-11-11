// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lockStep, INITIAL_LOCK_STATE, type LockEvent, type LockState } from './face-id-lock.ts';

// Feeds events in order and counts how many Face ID prompts were opened.
function run(events: LockEvent[], start: LockState = INITIAL_LOCK_STATE) {
  let state = start;
  let prompts = 0;
  for (const e of events) {
    const r = lockStep(state, e);
    state = r.state;
    if (r.prompt) prompts++;
  }
  return { state, prompts };
}

const on = (appState = 'active'): LockEvent => ({ type: 'protect', on: true, appState });
// Events carry a clock; each helper call advances it, so ordinary sequences
// are a few hundred ms apart. `later` jumps well past the grace period.
let clock = 0;
const tick = (ms = 200) => (clock += ms);
const app = (state: string, wait = 200): LockEvent => ({ type: 'appState', state, at: tick(wait) });
const done = (ok: boolean, wait = 200): LockEvent => ({ type: 'promptDone', ok, at: tick(wait) });
const later = 10_000;

test('opening the app asks once, and the Face ID sheet itself does not ask again', () => {
  // The sheet makes iOS report inactive, then active once it closes; the
  // result can arrive either side of that 'active'.
  const before = run([on(), app('inactive'), done(true), app('active')]);
  assert.equal(before.prompts, 1);
  assert.equal(before.state.locked, false);
  const after = run([on(), app('inactive'), app('active'), done(true)]);
  assert.equal(after.prompts, 1);
  assert.equal(after.state.locked, false);
});

test('a cold start that is not yet active asks once, on activation', () => {
  const r = run([on('unknown'), app('active'), app('inactive'), app('active'), done(true)]);
  assert.equal(r.prompts, 1);
  assert.equal(r.state.locked, false);
});

test('a cancelled scan waits for the Unlock button instead of asking again', () => {
  const r = run([on(), app('inactive'), done(false), app('active')]);
  assert.equal(r.prompts, 1);
  assert.equal(r.state.locked, true);
  const retried = run([{ type: 'retry' }, done(true)], r.state);
  assert.equal(retried.prompts, 1);
  assert.equal(retried.state.locked, false);
});

test('Control Centre or the notification shade does not lock', () => {
  const r = run([on(), done(true), app('inactive'), app('active')]);
  assert.equal(r.prompts, 1);
  assert.equal(r.state.locked, false);
});

test('leaving the app locks it, and coming back asks once', () => {
  const r = run([on(), done(true), app('inactive', later), app('background'), app('active'), app('inactive'), done(true), app('active')]);
  assert.equal(r.prompts, 2);
  assert.equal(r.state.locked, false);
});

test('protection dropping and returning in the same visit does not ask again', () => {
  // e.g. a lingering demo flag cleared on launch, or sign-out and sign-in.
  const r = run([on(), done(true), { type: 'protect', on: false, appState: 'active' }, on()]);
  assert.equal(r.prompts, 1);
  assert.equal(r.state.locked, false);
});

test('a second prompt is never opened while one is showing', () => {
  const r = run([on(), { type: 'retry' }, app('active'), { type: 'retry' }]);
  assert.equal(r.prompts, 1);
});

test('turning the lock off unlocks at once', () => {
  const r = run([on(), { type: 'protect', on: false, appState: 'active' }]);
  assert.equal(r.state.locked, false);
});

test('the passcode screen (Expo Go, or after failed scans) does not ask again', () => {
  // iOS reports 'background' while the passcode screen shows, sometimes
  // after the passcode was already accepted.
  const during = run([on(), app('inactive'), app('background'), done(true), app('active')]);
  assert.equal(during.prompts, 1);
  assert.equal(during.state.locked, false);
  const late = run([on(), app('inactive'), done(true), app('background', 300), app('active')]);
  assert.equal(late.prompts, 1);
  assert.equal(late.state.locked, false);
  const lateFirst = run([on(), done(true), app('background', 400), app('active'), app('inactive')]);
  assert.equal(lateFirst.prompts, 1);
  assert.equal(lateFirst.state.locked, false);
});

test('really leaving soon after unlocking still locks once the grace period is over', () => {
  const r = run([on(), done(true), app('background', 2000), app('active')]);
  assert.equal(r.prompts, 2);
  assert.equal(r.state.locked, true);
});
