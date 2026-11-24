/**
 * Seeds the exact reason catalogue from the "Cancel / Reject Reasons" spec,
 * section 3 -- the texts already hardcoded in both apps today.
 *
 * Idempotent: upserts on { app, action, service, code }, safe to re-run.
 *
 * Usage: node scripts/seed-cancel-reasons.mjs
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const row = (app, action, service, sortOrder, code, label) => ({
  app, action, service, sortOrder, code, label, labelHi: '', isActive: true,
});

const REASONS = [
  // 3.1 User app, cancel
  row('user', 'cancel', 'food', 1, 'ordered_by_mistake', 'Ordered by mistake'),
  row('user', 'cancel', 'food', 2, 'change_items_or_address', 'Want to change items or address'),
  row('user', 'cancel', 'food', 3, 'delivery_too_long', 'Delivery is taking too long'),
  row('user', 'cancel', 'food', 4, 'better_price_elsewhere', 'Found a better price elsewhere'),
  row('user', 'cancel', 'food', 5, 'restaurant_asked', 'Restaurant asked me to cancel'),

  row('user', 'cancel', 'ride', 1, 'driver_too_long', 'Driver is taking too long'),
  row('user', 'cancel', 'ride', 2, 'driver_asked', 'Driver asked me to cancel'),
  row('user', 'cancel', 'ride', 3, 'booked_by_mistake', 'Booked by mistake'),
  row('user', 'cancel', 'ride', 4, 'changed_plans', 'Changed my plans'),
  row('user', 'cancel', 'ride', 5, 'found_another_ride', 'Found another ride'),

  row('user', 'cancel', 'parcel', 1, 'captain_too_long', 'Captain is taking too long'),
  row('user', 'cancel', 'parcel', 2, 'booked_by_mistake', 'Booked by mistake'),
  row('user', 'cancel', 'parcel', 3, 'wrong_address', 'Wrong pickup or drop address'),
  row('user', 'cancel', 'parcel', 4, 'parcel_not_ready', 'Parcel is not ready'),
  row('user', 'cancel', 'parcel', 5, 'changed_plans', 'Changed my plans'),

  row('user', 'cancel', 'service', 1, 'booked_by_mistake', 'Booked by mistake'),
  row('user', 'cancel', 'service', 2, 'professional_too_long', 'Professional is taking too long'),
  row('user', 'cancel', 'service', 3, 'different_time', 'Want a different time'),
  row('user', 'cancel', 'service', 4, 'no_longer_needed', 'No longer need the service'),

  // 3.2 Delivery app, cancel after accepting -- ride
  row('delivery', 'cancel', 'ride', 1, 'party_not_reachable', 'Passenger not reachable'),
  row('delivery', 'cancel', 'ride', 2, 'party_asked', 'Passenger asked to cancel'),
  row('delivery', 'cancel', 'ride', 3, 'wrong_pickup', 'Wrong pickup location'),
  row('delivery', 'cancel', 'ride', 4, 'vehicle_problem', 'Vehicle problem'),
  row('delivery', 'cancel', 'ride', 5, 'too_far_from_pickup', 'Too far from pickup'),
  row('delivery', 'cancel', 'ride', 6, 'emergency', 'Emergency'),

  // 3.2 parcel (same codes, different labels for party_not_reachable/party_asked)
  row('delivery', 'cancel', 'parcel', 1, 'party_not_reachable', 'Customer not reachable'),
  row('delivery', 'cancel', 'parcel', 2, 'party_asked', 'Customer asked to cancel'),
  row('delivery', 'cancel', 'parcel', 3, 'wrong_pickup', 'Wrong pickup location'),
  row('delivery', 'cancel', 'parcel', 4, 'vehicle_problem', 'Vehicle problem'),
  row('delivery', 'cancel', 'parcel', 5, 'too_far_from_pickup', 'Too far from pickup'),
  row('delivery', 'cancel', 'parcel', 6, 'emergency', 'Emergency'),

  // 3.2 scheduled_ride (no "Other" -- enforced in code via allowsOther())
  row('delivery', 'cancel', 'scheduled_ride', 1, 'not_available', 'Not available at that time'),
  row('delivery', 'cancel', 'scheduled_ride', 2, 'vehicle_problem', 'Vehicle problem'),
  row('delivery', 'cancel', 'scheduled_ride', 3, 'pickup_too_far', 'Pickup is too far'),
  row('delivery', 'cancel', 'scheduled_ride', 4, 'customer_asked', 'Customer asked me to cancel'),
  row('delivery', 'cancel', 'scheduled_ride', 5, 'personal_emergency', 'Personal emergency'),

  // 3.3 Delivery app, reject -- same list for food/ride/parcel
  ...['food', 'ride', 'parcel'].flatMap((service) => [
    row('delivery', 'reject', service, 1, 'too_far', 'Too far'),
    row('delivery', 'reject', service, 2, 'busy', 'Busy with another order'),
    row('delivery', 'reject', service, 3, 'vehicle_problem', 'Vehicle problem'),
    row('delivery', 'reject', service, 4, 'taking_break', 'Taking a break'),
    row('delivery', 'reject', service, 5, 'wrong_area', 'Wrong area'),
  ]),
];

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGODB_URI / MONGO_URI in environment.');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || undefined });

  const { CancelReason } = await import('../src/core/cancelReasons/models/cancelReason.model.js');

  let created = 0;
  let updated = 0;
  for (const r of REASONS) {
    const result = await CancelReason.updateOne(
      { app: r.app, action: r.action, service: r.service, code: r.code },
      { $setOnInsert: { label: r.label, labelHi: r.labelHi, isActive: r.isActive }, $set: { sortOrder: r.sortOrder } },
      { upsert: true },
    );
    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
  }

  console.log(`${REASONS.length} rows in catalogue: ${created} created, ${updated} had sortOrder refreshed, ${REASONS.length - created - updated} already matched.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err);
  process.exitCode = 1;
});
