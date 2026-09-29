// Identity merge, phase 1: one platform identity per customer, linked explicitly.
//
// Run: node tests/identity.smoke.mjs

import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let failures = 0;
const check = (name, fn) => {
    if (fn.constructor.name === 'AsyncFunction') throw new Error(`check("${name}") given an async fn`);
    try { fn(); console.log(`  ok   ${name}`); }
    catch (err) { failures++; console.log(`  FAIL ${name}\n         ${err.message}`); }
};

process.env.MONGOMS_STARTUP_TIMEOUT ||= '180000';
const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri();
process.env.NODE_ENV = 'test';
await mongoose.connect(process.env.MONGO_URI);

const { FoodUser } = await import('../src/core/users/user.model.js');
const { ensurePlatformUser } = await import('../src/core/identity/identityLink.service.js');
const { resolveCustomerIdentities } = await import('../src/core/activity/identityResolver.js');

console.log('\n[1] ensurePlatformUser');
{
    const id1 = await ensurePlatformUser({ phone: '9876500001', name: 'A' });
    check('creates a platform user for a new phone', () => assert.ok(id1));

    const id2 = await ensurePlatformUser({ phone: '+91 98765 00001' });
    check('a prefixed variant of the same phone reuses it', () => assert.equal(String(id2), String(id1)));

    const before = await FoodUser.countDocuments();
    await ensurePlatformUser({ phone: '9876500001' });
    const after = await FoodUser.countDocuments();
    check('no duplicate platform users created', () => assert.equal(after, before));

    const bad = await ensurePlatformUser({ phone: '123' });
    check('unusable phone -> null, not a throw', () => assert.equal(bad, null));

    const stored = await FoodUser.findById(id1).lean();
    check('created identity stores the normalized phone', () => assert.equal(stored.phone, '9876500001'));
}

console.log('\n[2] the resolver covers the caller\'s own identity');
{
    const master = await FoodUser.create({ phone: '9876500003', name: 'Solo' });
    const r = await resolveCustomerIdentities(master._id);
    check('resolves to exactly the caller\'s own id', () => assert.deepEqual(r.ids, [master._id]));
    check('food/taxi is always reported resolved', () => assert.ok(r.resolved.includes('food/taxi')));

    const other = await FoodUser.create({ phone: '9876500007', name: 'Other' });
    const r2 = await resolveCustomerIdentities(other._id);
    check('no cross-customer leakage', () => assert.equal(r2.ids.length, 1));
}

await mongoose.disconnect();
await mongod.stop();
console.log(`\n${failures === 0 ? 'PASS' : `FAIL — ${failures} check(s) failed`}\n`);
process.exit(failures === 0 ? 0 : 1);
