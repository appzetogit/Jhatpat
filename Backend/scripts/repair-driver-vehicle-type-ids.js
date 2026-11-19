/**
 * One-off repair for drivers created before ensureUnifiedDriverForPartner
 * looked vehicleType up by catalogue id as well as by icon_types.
 *
 * Those drivers have vehicleTypeId: null, so matchingService's
 * vehicleTypeId clause never finds them for dispatch. vehicleType (string)
 * still holds either a catalogue id or an icon-type key like "bike" --
 * resolve it the same way goOnline now self-heals it, so a driver who
 * never goes online again (or hasn't yet) still gets fixed.
 *
 * Usage:
 *   node scripts/repair-driver-vehicle-type-ids.js            # DRY RUN
 *   node scripts/repair-driver-vehicle-type-ids.js --apply    # actually write
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const APPLY = process.argv.includes('--apply');

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGODB_URI / MONGO_URI in environment.');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || undefined });

  const { Driver } = await import('../src/modules/taxi/driver/models/Driver.js');
  const { Vehicle } = await import('../src/modules/taxi/admin/models/Vehicle.js');

  const drivers = await Driver.find({
    $or: [{ vehicleTypeId: null }, { vehicleTypeId: { $exists: false } }],
    vehicleType: { $nin: [null, ''] },
  }).select('_id vehicleType vehicleIconType').lean();

  console.log(`${drivers.length} driver(s) with vehicleType set but vehicleTypeId missing.`);

  let fixed = 0;
  let unresolved = 0;
  for (const d of drivers) {
    const raw = String(d.vehicleType).trim();
    const matchedVehicle = mongoose.Types.ObjectId.isValid(raw)
      ? await Vehicle.findById(raw).select('_id icon_types').lean()
      : await Vehicle.findOne({ icon_types: raw.toLowerCase() }).select('_id icon_types').lean();

    if (!matchedVehicle) {
      console.log(`  ! ${d._id}: no catalogue match for vehicleType "${raw}"`);
      unresolved += 1;
      continue;
    }

    console.log(`  + ${d._id}: vehicleType "${raw}" -> vehicleTypeId ${matchedVehicle._id}`);
    if (APPLY) {
      await Driver.updateOne(
        { _id: d._id },
        { $set: { vehicleTypeId: matchedVehicle._id, vehicleIconType: matchedVehicle.icon_types || d.vehicleIconType } },
      );
    }
    fixed += 1;
  }

  console.log(`\n${APPLY ? 'Fixed' : 'Would fix'}: ${fixed}. Unresolved: ${unresolved}.`);
  if (!APPLY) console.log('Dry run only -- re-run with --apply to write.');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('repair failed:', err);
  process.exitCode = 1;
});
