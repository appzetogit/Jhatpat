import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Sets the fare table + admin commission for every Ride (transport_type:
// 'taxi') and Parcel (transport_type: 'delivery') SetPrice row, across every
// service location and vehicle type:
//
//   Rides:  base_price 30, base_distance 3km, price_per_distance 6/km
//   Parcel: base_price 50, base_distance 3km, price_per_distance 10/km
//   Commission (both services, both sides): 10% from the rider (admin_commision)
//     and 10% from the driver (admin_commission_from_driver) -- the two fields
//     the fare/wallet code already reads, just previously left at 0.
//
// Ride rows: updates every existing row (there is one per location x vehicle
// already) and activates it. Parcel rows: none exist yet (transport_type
// 'delivery' had no rows), so this creates one per location x vehicle.
//
// Re-run-safe: ride rows are matched by (vehicle_type, service_location_id,
// transport_type: 'taxi') and upserted; parcel rows by the same key with
// transport_type: 'delivery'.

const RIDE_FARE = { base_price: 30, base_distance: 3, price_per_distance: 6, time_price: 0 };
const PARCEL_FARE = { base_price: 50, base_distance: 3, price_per_distance: 10, time_price: 0 };
const COMMISSION = {
  admin_commision_type: 1, // percentage
  admin_commision: 10, // from the rider
  admin_commission_type_from_driver: 1, // percentage
  admin_commission_from_driver: 10, // from the driver
};

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const { SetPrice } = await import('../src/modules/taxi/admin/models/SetPrice.js');
  const { Vehicle } = await import('../src/modules/taxi/admin/models/Vehicle.js');
  const { ServiceLocation } = await import('../src/modules/taxi/admin/models/ServiceLocation.js');

  const vehicles = await Vehicle.find({}).select('_id name').lean();
  const locations = await ServiceLocation.find({}).select('_id service_location_name name').lean();

  console.log(`${vehicles.length} vehicle types x ${locations.length} service locations`);

  let rideUpdated = 0;
  let rideCreated = 0;
  for (const loc of locations) {
    for (const veh of vehicles) {
      const filter = {
        vehicle_type: veh._id,
        service_location_id: loc._id,
        transport_type: 'taxi',
      };
      const res = await SetPrice.updateOne(
        filter,
        {
          $set: {
            ...RIDE_FARE,
            ...COMMISSION,
            waiting_charge: 0,
            status: 'active',
            active: 1,
            payment_type: ['cash', 'online', 'wallet'],
          },
          $setOnInsert: {
            ...filter,
            pricing_scope: 'ride',
            zone_id: null,
          },
        },
        { upsert: true },
      );
      if (res.upsertedCount) rideCreated += 1;
      else rideUpdated += 1;
    }
  }
  console.log(`Ride rows: ${rideUpdated} updated, ${rideCreated} created`);

  let parcelUpdated = 0;
  let parcelCreated = 0;
  for (const loc of locations) {
    for (const veh of vehicles) {
      const filter = {
        vehicle_type: veh._id,
        service_location_id: loc._id,
        transport_type: 'delivery',
      };
      const res = await SetPrice.updateOne(
        filter,
        {
          $set: {
            ...PARCEL_FARE,
            ...COMMISSION,
            waiting_charge: 0,
            status: 'active',
            active: 1,
            payment_type: ['cash', 'online', 'wallet'],
          },
          $setOnInsert: {
            ...filter,
            pricing_scope: 'ride',
            zone_id: null,
          },
        },
        { upsert: true },
      );
      if (res.upsertedCount) parcelCreated += 1;
      else parcelUpdated += 1;
    }
  }
  console.log(`Parcel rows: ${parcelUpdated} updated, ${parcelCreated} created`);

  console.log('done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err);
  process.exitCode = 1;
});
