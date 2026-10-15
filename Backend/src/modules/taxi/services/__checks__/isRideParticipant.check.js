/**
 * isRideParticipant is the single gate on a ride's chat and live location.
 * The bug this guards: an uppercase or unrecognised role (as the unified
 * auth system issues -- 'USER', 'DELIVERY_PARTNER') must never be let
 * through just because it didn't match either lowercase branch.
 *
 * Run: node src/modules/taxi/services/__checks__/isRideParticipant.check.js
 */
import assert from 'node:assert/strict';
import { isRideParticipant } from '../rideService.js';

let failed = 0;
const check = (label, fn) => {
  try {
    fn();
    console.log(`  ok  ${label}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${label}\n      ${err.message}`);
  }
};

const ride = { userId: 'user-1', driverId: 'driver-1' };

check('the ride\'s own user, lowercase role', () => {
  assert.equal(isRideParticipant({ role: 'user', entityId: 'user-1', ride }), true);
});

check('the ride\'s own driver, lowercase role', () => {
  assert.equal(isRideParticipant({ role: 'driver', entityId: 'driver-1', ride }), true);
});

check('a different user is denied', () => {
  assert.equal(isRideParticipant({ role: 'user', entityId: 'user-2', ride }), false);
});

check('a different driver is denied', () => {
  assert.equal(isRideParticipant({ role: 'driver', entityId: 'driver-2', ride }), false);
});

check('uppercase USER role still matches its own ride (case-insensitive)', () => {
  assert.equal(isRideParticipant({ role: 'USER', entityId: 'user-1', ride }), true);
});

check('uppercase USER role on someone else\'s ride is denied', () => {
  assert.equal(isRideParticipant({ role: 'USER', entityId: 'user-2', ride }), false);
});

check('REGRESSION: an unrecognised role (e.g. DELIVERY_PARTNER) is denied, not let through', () => {
  assert.equal(isRideParticipant({ role: 'DELIVERY_PARTNER', entityId: 'user-1', ride }), false);
  assert.equal(isRideParticipant({ role: 'ADMIN', entityId: 'driver-1', ride }), false);
  assert.equal(isRideParticipant({ role: '', entityId: 'user-1', ride }), false);
  assert.equal(isRideParticipant({ role: undefined, entityId: 'user-1', ride }), false);
});

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nall checks passed');
