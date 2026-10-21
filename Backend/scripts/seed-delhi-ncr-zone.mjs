import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Delhi NCR ServiceLocation + Zone (Taxi) and FoodZone (Food), covering the
// NCR region (Delhi + Gurugram + Noida + Faridabad + Ghaziabad) as a
// bounding rectangle from Google's own geocoded bounds -- same reasoning as
// the Haryana seed: a multi-city region has no single small polygon the way
// a single city zone does.
//
// Idempotent: $setOnInsert / find-first everywhere, safe to re-run.

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

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

const ZONE_NAME = 'Delhi NCR';

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (!GOOGLE_KEY) throw new Error('GOOGLE_MAPS_API_KEY is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const { uploadImageBuffer } = await import('../src/services/cloudinary.service.js');

  console.log('==> Geocoding Delhi NCR bounds');
  // NCR is not a single administrative area Google can bound on its own, so
  // bound Delhi (the core) and widen it to include Gurugram, Noida,
  // Faridabad and Ghaziabad explicitly, same spirit as the Haryana
  // state-wide rectangle but assembled from the actual NCR member cities.
  const members = ['New Delhi, India', 'Gurugram, Haryana, India', 'Noida, Uttar Pradesh, India', 'Faridabad, Haryana, India', 'Ghaziabad, Uttar Pradesh, India'];
  const geos = [];
  for (const address of members) {
    const geo = await geocode(address);
    const bounds = geo?.geometry?.bounds || geo?.geometry?.viewport;
    if (bounds) geos.push(bounds);
    console.log(`   ${address}: ${bounds ? 'resolved' : 'NOT RESOLVED'}`);
  }
  if (!geos.length) throw new Error('Could not resolve any NCR member bounds');

  const sw = { lat: Math.min(...geos.map((b) => b.southwest.lat)), lng: Math.min(...geos.map((b) => b.southwest.lng)) };
  const ne = { lat: Math.max(...geos.map((b) => b.northeast.lat)), lng: Math.max(...geos.map((b) => b.northeast.lng)) };
  console.log('   combined bounds:', JSON.stringify({ sw, ne }));

  // ----- Taxi: ServiceLocation -----
  let serviceLocation = await ServiceLocation.findOne({ service_location_name: ZONE_NAME });
  if (!serviceLocation) {
    serviceLocation = await ServiceLocation.create({
      name: ZONE_NAME, service_location_name: ZONE_NAME, address: 'Delhi NCR, India',
      country: 'India', currency_name: 'Indian Rupee', currency_symbol: '₹',
    });
    console.log('   + ServiceLocation Delhi NCR created');
  } else {
    console.log('   = ServiceLocation Delhi NCR already exists');
  }

  // ----- Taxi: Zone (GeoJSON Polygon ring, [lng,lat], closed) -----
  const ring = [
    [sw.lng, sw.lat], [ne.lng, sw.lat], [ne.lng, ne.lat], [sw.lng, ne.lat], [sw.lng, sw.lat],
  ];

  let taxiZone = await Zone.findOne({ name: ZONE_NAME });
  if (!taxiZone) {
    taxiZone = await Zone.create({
      name: ZONE_NAME,
      service_location_id: serviceLocation._id,
      boundary_mode: 'polygon',
      active: true,
      status: 'active',
      geometry: { type: 'Polygon', coordinates: [ring] },
      popular_places: [],
    });
    console.log('   + Taxi Zone Delhi NCR created');
  } else {
    console.log('   = Taxi Zone Delhi NCR already exists');
  }

  // ----- Food: FoodZone (its own coordinate shape: [{latitude,longitude}]) -----
  const foodRing = [
    { latitude: sw.lat, longitude: sw.lng },
    { latitude: ne.lat, longitude: sw.lng },
    { latitude: ne.lat, longitude: ne.lng },
    { latitude: sw.lat, longitude: ne.lng },
  ];
  let foodZone = await FoodZone.findOne({ name: ZONE_NAME });
  if (!foodZone) {
    foodZone = await FoodZone.create({
      name: ZONE_NAME, zoneName: ZONE_NAME, country: 'India', serviceLocation: ZONE_NAME,
      boundary_mode: 'polygon', coordinates: foodRing, isActive: true,
    });
    console.log('   + Food Zone Delhi NCR created');
  } else {
    console.log('   = Food Zone Delhi NCR already exists');
  }

  // ----- Taxi: popular places (real NCR landmarks, verified + photographed) -----
  const candidates = [
    { name: 'India Gate', query: 'India Gate, New Delhi' },
    { name: 'Connaught Place', query: 'Connaught Place, New Delhi' },
    { name: 'Cyber Hub', query: 'Cyber Hub, DLF Cyber City, Gurugram' },
    { name: 'DLF Mall of India', query: 'DLF Mall of India, Noida' },
    { name: 'Indira Gandhi International Airport', query: 'Indira Gandhi International Airport, Delhi' },
    { name: 'Akshardham Temple', query: 'Akshardham Temple, Delhi' },
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

  // ----- Taxi: fare rows for Delhi NCR x every active vehicle, inactive until priced -----
  // Deliberately ₹0 / inactive, same as every other seeded zone: real fares
  // are a money decision only an admin should set, via the admin panel.
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
  console.log(`   = fare rows ensured for ${vehicles.length} vehicle types in Delhi NCR (inactive, admin must price them)`);

  console.log('done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err);
  process.exitCode = 1;
});
