import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Static images live in Frontend/public and are served from the frontend origin,
// so they are referenced by root-relative path (same style as '/food/taxi1.jpeg').
const publicImg = (relative) => `/${relative}`;

const load = async (path, name) => {
  const mod = await import(path);
  const model = mod.default ?? mod[name];
  if (!model) throw new Error(`model ${name} not found in ${path}`);
  return model;
};

const MODELS = {
  Country: await load('../src/modules/taxi/admin/models/Country.js', 'Country'),
  AppLanguage: await load('../src/modules/taxi/admin/models/AppLanguage.js', 'AppLanguage'),
  TaxiTransportType: await load('../src/modules/taxi/admin/models/TaxiTransportType.js', 'TaxiTransportType'),
  TaxiAppModule: await load('../src/modules/taxi/admin/models/TaxiAppModule.js', 'TaxiAppModule'),
  GoodsType: await load('../src/modules/taxi/admin/models/GoodsType.js', 'GoodsType'),
  DriverNeededDocument: await load('../src/modules/taxi/admin/models/DriverNeededDocument.js', 'DriverNeededDocument'),
  RentalPackageType: await load('../src/modules/taxi/admin/models/RentalPackageType.js', 'RentalPackageType'),
  ServiceLocation: await load('../src/modules/taxi/admin/models/ServiceLocation.js', 'ServiceLocation'),
  Vehicle: await load('../src/modules/taxi/admin/models/Vehicle.js', 'Vehicle'),
  Banner: await load('../src/modules/taxi/admin/promotions/models/Banner.js', 'Banner'),
};

const CATALOG = [
  ['Country', { code: 'IN' }, { name: 'India', code: 'IN', active: true }],

  ['AppLanguage', { code: 'en' }, { name: 'English', code: 'en', active: 1, default_status: 1 }],
  ['AppLanguage', { code: 'hi' }, { name: 'Hindi', code: 'hi', active: 1, default_status: 0 }],

  ['TaxiTransportType', { name: 'taxi' }, { name: 'taxi', display_name: 'Taxi', active: true }],
  ['TaxiTransportType', { name: 'delivery' }, { name: 'delivery', display_name: 'Delivery', active: true }],

  ['TaxiAppModule', { name: 'Ride', transport_type: 'taxi', service_type: 'normal' },
    { name: 'Ride', transport_type: 'taxi', service_type: 'normal', order_by: 1, active: 1,
      short_description: 'Book a ride now', description: 'Quick rides across your city.' }],
  ['TaxiAppModule', { name: 'Rental', transport_type: 'taxi', service_type: 'rental' },
    { name: 'Rental', transport_type: 'taxi', service_type: 'rental', order_by: 2, active: 1,
      short_description: 'Hourly car rental', description: 'Hire a vehicle by the hour or by package.' }],
  ['TaxiAppModule', { name: 'Outstation', transport_type: 'taxi', service_type: 'outstation' },
    { name: 'Outstation', transport_type: 'taxi', service_type: 'outstation', order_by: 3, active: 1,
      short_description: 'Trips between cities', description: 'Travel to another city in comfort.' }],
  ['TaxiAppModule', { name: 'Parcel', transport_type: 'delivery', service_type: 'normal' },
    { name: 'Parcel', transport_type: 'delivery', service_type: 'normal', order_by: 4, active: 1,
      short_description: 'Send a parcel', description: 'Deliver parcels and goods across the city.' }],

  ...['Documents', 'Electronics', 'Groceries', 'Clothing', 'Furniture', 'Medicines', 'Food packets', 'Fragile items']
    .map((name, i) => ['GoodsType', { goods_type_name: name }, {
      goods_type_name: name, goods_types_for: 'both', active: 1, status: 'active', external_id: i + 1,
    }]),

  ...[
    ['driving_license', 'Driving License', 'front_back', true, true],
    ['vehicle_rc', 'Vehicle Registration (RC)', 'front_back', true, true],
    ['aadhaar', 'Aadhaar Card', 'front_back', false, true],
    ['pan', 'PAN Card', 'front', false, true],
    ['vehicle_insurance', 'Vehicle Insurance', 'front', true, false],
    ['profile_photo', 'Profile Photo', 'image', false, false],
  ].map(([slug, name, imageType, hasExpiry, hasIdNumber]) => ['DriverNeededDocument', { slug }, {
    template_type: 'document', slug, name, account_type: 'individual', image_type: imageType,
    has_expiry_date: hasExpiry, has_identify_number: hasIdNumber,
  }]),

  ['RentalPackageType', { name: 'Hourly Rental', transport_type: 'taxi' }, {
    name: 'Hourly Rental', transport_type: 'taxi', short_description: 'Pay per hour',
    description: 'Hire a vehicle for a set number of hours within the city.', status: 'active', active: true,
  }],
  ['RentalPackageType', { name: 'Airport Transfer', transport_type: 'taxi' }, {
    name: 'Airport Transfer', transport_type: 'taxi', short_description: 'Pick-up and drop at the airport',
    description: 'Fixed-route transfer to or from the airport.', status: 'active', active: true,
  }],
  ['RentalPackageType', { name: 'Full Day Outstation', transport_type: 'taxi' }, {
    name: 'Full Day Outstation', transport_type: 'taxi', short_description: 'A full day out of town',
    description: 'Dedicated vehicle for a full day trip beyond city limits.', status: 'active', active: true,
  }],

  ['ServiceLocation', { service_location_name: 'Indore' }, {
    name: 'Indore', service_location_name: 'Indore', address: 'Indore, Madhya Pradesh, India',
    country: 'India', currency_name: 'Indian Rupee', currency_symbol: '₹',
  }],
  ['ServiceLocation', { service_location_name: 'Bhopal' }, {
    name: 'Bhopal', service_location_name: 'Bhopal', address: 'Bhopal, Madhya Pradesh, India',
    country: 'India', currency_name: 'Indian Rupee', currency_symbol: '₹',
  }],

  ...[
    ['Bike', 'bike'], ['Auto', 'auto'], ['Mini', 'car'], ['Sedan', 'car'], ['SUV', 'suv'],
  ].map(([name, icon]) => ['Vehicle', { name }, { name, icon_type: icon, active: true }]),

  ['Banner', { title: 'Ride with Jhatpat' }, {
    title: 'Ride with Jhatpat', image: publicImg('hero2.png'), link_type: 'external_link',
    external_link: 'https://jhatpattaxi.com/taxi', active: true,
  }],
];

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const results = { created: 0, existing: 0, failed: 0 };
  for (const [modelName, key, doc] of CATALOG) {
    try {
      const res = await MODELS[modelName].updateOne(key, { $setOnInsert: doc }, { upsert: true, runValidators: true });
      if (res.upsertedCount) {
        results.created += 1;
        console.log(`  + ${modelName} ${JSON.stringify(key)}`);
      } else {
        results.existing += 1;
      }
    } catch (err) {
      results.failed += 1;
      console.error(`  ! ${modelName} ${JSON.stringify(key)}: ${err.message}`);
    }
  }

  console.log(`done — created ${results.created}, already present ${results.existing}, failed ${results.failed}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err.message);
  process.exitCode = 1;
});
