import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Haryana ServiceLocation + Zone (Taxi) and FoodZone (Food), covering the
// whole state as a rectangle from Google's own geocoded bounds -- the state
// has no single small polygon the way a city zone does, and the user asked
// for state-wide coverage, so a bounding rectangle is the honest shape for
// "the whole state" rather than a precise (and much larger) outline.
//
// Idempotent: $setOnInsert / find-first everywhere, safe to re-run.

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

const load = async (path, name) => {
  const mod = await import(path);
  const model = mod.default ?? mod[name];
  if (!model) throw new Error(`model ${name} not found in ${path}`);
  return model;
};

const { ServiceLocation } = await import('../src/modules/taxi/admin/models/ServiceLocation.js');
const { Zone } = await import('../src/modules/taxi/driver/models/Zone.js');
const { FoodZone } = await import('../src/modules/food/admin/models/zone.model.js');
const { Vehicle } = await import('../src/modules/taxi/admin/models/Vehicle.js');
const { SetPrice } = await import('../src/modules/taxi/admin/models/SetPrice.js');

const geocode = async (address) => {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}`);
  const data = await res.json();
  return data.results?.[0] || null;
};

const textSearch = async (query) => {
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`);
  const data = await res.json();
  return data.results?.[0] || null;
};

const downloadPhoto = async (photoReference, maxwidth = 800) => {
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${GOOGLE_KEY}`);
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType };
};

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (!GOOGLE_KEY) throw new Error('GOOGLE_MAPS_API_KEY is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const { uploadImageBuffer } = await import('../src/services/cloudinary.service.js');

  console.log('==> Geocoding Haryana state bounds');
  const geo = await geocode('Haryana, India');
  const bounds = geo?.geometry?.bounds || geo?.geometry?.viewport;
  if (!bounds) throw new Error('Could not resolve Haryana bounds');
  const { northeast: ne, southwest: sw } = bounds;
  console.log('   bounds:', JSON.stringify(bounds));

  // ----- Taxi: ServiceLocation -----
  let serviceLocation = await ServiceLocation.findOne({ service_location_name: 'Haryana' });
  if (!serviceLocation) {
    serviceLocation = await ServiceLocation.create({
      name: 'Haryana', service_location_name: 'Haryana', address: 'Haryana, India',
      country: 'India', currency_name: 'Indian Rupee', currency_symbol: '₹',
    });
    console.log('   + ServiceLocation Haryana created');
  } else {
    console.log('   = ServiceLocation Haryana already exists');
  }

  // ----- Taxi: Zone (GeoJSON Polygon ring, [lng,lat], closed) -----
  const ring = [
    [sw.lng, sw.lat], [ne.lng, sw.lat], [ne.lng, ne.lat], [sw.lng, ne.lat], [sw.lng, sw.lat],
  ];

  let taxiZone = await Zone.findOne({ name: 'Haryana' });
  if (!taxiZone) {
    taxiZone = await Zone.create({
      name: 'Haryana',
      service_location_id: serviceLocation._id,
      boundary_mode: 'polygon',
      active: true,
      status: 'active',
      geometry: { type: 'Polygon', coordinates: [ring] },
      popular_places: [],
    });
    console.log('   + Taxi Zone Haryana created');
  } else {
    console.log('   = Taxi Zone Haryana already exists');
  }

  // ----- Food: FoodZone (its own coordinate shape: [{latitude,longitude}]) -----
  const foodRing = [
    { latitude: sw.lat, longitude: sw.lng },
    { latitude: ne.lat, longitude: sw.lng },
    { latitude: ne.lat, longitude: ne.lng },
    { latitude: sw.lat, longitude: ne.lng },
  ];
  let foodZone = await FoodZone.findOne({ name: 'Haryana' });
  if (!foodZone) {
    foodZone = await FoodZone.create({
      name: 'Haryana', zoneName: 'Haryana', country: 'India', serviceLocation: 'Haryana',
      boundary_mode: 'polygon', coordinates: foodRing, isActive: true,
    });
    console.log('   + Food Zone Haryana created');
  } else {
    console.log('   = Food Zone Haryana already exists');
  }

  // ----- Taxi: popular places (real Gurugram landmarks, verified + photographed) -----
  const candidates = [
    { name: 'Kingdom of Dreams', query: 'Kingdom of Dreams, Sector 29, Gurugram' },
    { name: 'Cyber Hub', query: 'Cyber Hub, DLF Cyber City, Gurugram' },
    { name: 'Ambience Mall Gurugram', query: 'Ambience Mall, Gurugram' },
    { name: 'Sheetla Mata Mandir', query: 'Sheetla Mata Mandir, Gurugram' },
    { name: 'Gurugram Railway Station', query: 'Gurugram Railway Station' },
  ];

  const existingNames = new Set((taxiZone.popular_places || []).map((p) => p.name));
  for (const c of candidates) {
    if (existingNames.has(c.name)) { console.log(`   = popular place "${c.name}" already present`); continue; }
    const place = await textSearch(c.query);
    if (!place) { console.log(`   ! no geocode result for "${c.name}"`); continue; }

    let imageUrl = '';
    const photoRef = place.photos?.[0]?.photo_reference;
    if (photoRef) {
      const photo = await downloadPhoto(photoRef);
      if (photo) {
        const dataUrl = `data:${photo.contentType};base64,${photo.buf.toString('base64')}`;
        const url = await uploadImageBuffer(photo.buf, 'Jhatpat-taxi');
        imageUrl = url.startsWith('http') ? url : `https://jhatpattaxi.com${url}`;
      }
    }

    taxiZone.popular_places.push({
      name: c.name,
      address: place.formatted_address || '',
      location: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
      image: imageUrl,
      active: true,
    });
    console.log(`   + popular place "${c.name}" added${imageUrl ? ' (with photo)' : ' (no photo available)'}`);
  }
  await taxiZone.save();

  // ----- Taxi: fare rows for Haryana × every active vehicle, inactive until priced -----
  const vehicles = await Vehicle.find({ active: true }).lean();
  for (const vehicle of vehicles) {
    await SetPrice.updateOne(
      { pricing_scope: 'ride', transport_type: 'taxi', vehicle_type: vehicle._id, service_location_id: serviceLocation._id },
      {
        $setOnInsert: {
          service_location_id: serviceLocation._id, vehicle_type: vehicle._id, pricing_scope: 'ride', transport_type: 'taxi',
          base_price: 0, base_distance: 0, price_per_distance: 0, time_price: 0, waiting_charge: 0,
          status: 'inactive', active: 0, order_number: 1,
        },
      },
      { upsert: true, runValidators: true },
    );
  }
  console.log(`   = fare rows ensured for ${vehicles.length} vehicle types in Haryana (inactive, admin must price them)`);

  console.log('done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err);
  process.exitCode = 1;
});
