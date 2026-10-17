import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Converts the Haryana zone (taxi + food) into a Uttar Pradesh zone, in
// place: same documents, same _ids, so every existing link (restaurants'
// zoneId, SetPrice's service_location_id, delivery partners' zoneIds) keeps
// working without re-seeding a second zone's worth of data.
//
// City picked for the demo restaurants/partners: Lucknow (state capital).
// Re-run-safe: does nothing if the Haryana zone is already gone / already UP.

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

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
  return { buf: Buffer.from(await res.arrayBuffer()), contentType };
};

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (!GOOGLE_KEY) throw new Error('GOOGLE_MAPS_API_KEY is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const { ServiceLocation } = await import('../src/modules/taxi/admin/models/ServiceLocation.js');
  const { Zone } = await import('../src/modules/taxi/driver/models/Zone.js');
  const { FoodZone } = await import('../src/modules/food/admin/models/zone.model.js');
  const { FoodRestaurant } = await import('../src/modules/food/restaurant/models/restaurant.model.js');
  const { FoodDeliveryPartner } = await import('../src/modules/food/delivery/models/deliveryPartner.model.js');
  const { uploadImageBuffer } = await import('../src/services/cloudinary.service.js');

  console.log('==> Geocoding Uttar Pradesh state bounds');
  const geo = await geocode('Uttar Pradesh, India');
  const bounds = geo?.geometry?.bounds || geo?.geometry?.viewport;
  if (!bounds) throw new Error('Could not resolve Uttar Pradesh bounds');
  const { northeast: ne, southwest: sw } = bounds;
  console.log('   bounds:', JSON.stringify(bounds));

  // ----- ServiceLocation -----
  const serviceLocation = await ServiceLocation.findOne({ service_location_name: 'Haryana' });
  if (!serviceLocation) {
    console.log('No "Haryana" ServiceLocation found -- nothing to migrate (already renamed, or never created).');
  } else {
    serviceLocation.name = 'Uttar Pradesh';
    serviceLocation.service_location_name = 'Uttar Pradesh';
    serviceLocation.address = 'Uttar Pradesh, India';
    await serviceLocation.save();
    console.log('   ServiceLocation renamed Haryana -> Uttar Pradesh');
  }

  // ----- Taxi Zone -----
  const ring = [
    [sw.lng, sw.lat], [ne.lng, sw.lat], [ne.lng, ne.lat], [sw.lng, ne.lat], [sw.lng, sw.lat],
  ];
  const taxiZone = await Zone.findOne({ name: 'Haryana' });
  if (taxiZone) {
    taxiZone.name = 'Uttar Pradesh';
    taxiZone.geometry = { type: 'Polygon', coordinates: [ring] };

    console.log('==> Replacing popular places with real Lucknow landmarks');
    const candidates = [
      { name: 'Bara Imambara', query: 'Bara Imambara, Lucknow' },
      { name: 'Rumi Darwaza', query: 'Rumi Darwaza, Lucknow' },
      { name: 'Hazratganj Market', query: 'Hazratganj, Lucknow' },
      { name: 'Lucknow Charbagh Railway Station', query: 'Charbagh Railway Station, Lucknow' },
      { name: 'Ambedkar Memorial Park', query: 'Dr. Ambedkar Samajik Parivartan Sthal, Lucknow' },
    ];
    taxiZone.popular_places = [];
    for (const c of candidates) {
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
      console.log(`   + "${c.name}"${imageUrl ? ' (with photo)' : ' (no photo available)'}`);
    }
    await taxiZone.save();
    console.log('   Taxi Zone renamed Haryana -> Uttar Pradesh, popular places replaced');
  } else {
    console.log('No "Haryana" Taxi Zone found.');
  }

  // ----- Food Zone -----
  const foodRing = [
    { latitude: sw.lat, longitude: sw.lng },
    { latitude: ne.lat, longitude: sw.lng },
    { latitude: ne.lat, longitude: ne.lng },
    { latitude: sw.lat, longitude: ne.lng },
  ];
  const foodZoneRes = await FoodZone.updateOne(
    { name: 'Haryana' },
    { $set: { name: 'Uttar Pradesh', zoneName: 'Uttar Pradesh', serviceLocation: 'Uttar Pradesh', coordinates: foodRing } },
  );
  console.log(foodZoneRes.matchedCount ? '   Food Zone renamed Haryana -> Uttar Pradesh' : 'No "Haryana" Food Zone found.');

  // ----- Restaurants: move Gurugram/Haryana demo set to Lucknow/Uttar Pradesh -----
  const restaurants = await FoodRestaurant.find({ city: 'Gurugram', state: 'Haryana' });
  let restaurantsMoved = 0;
  for (const r of restaurants) {
    r.city = 'Lucknow';
    r.state = 'Uttar Pradesh';
    r.pincode = '226001';
    r.area = r.area ? r.area.replace(/Gurugram/gi, 'Lucknow') : r.area;
    if (r.addressLine1) r.addressLine1 = r.addressLine1;
    r.location = { type: 'Point', coordinates: [80.8 + Math.random() * 0.4, 26.7 + Math.random() * 0.4] };
    await r.save();
    restaurantsMoved += 1;
  }
  console.log(`   ${restaurantsMoved} restaurants moved to Lucknow, Uttar Pradesh`);

  // ----- Delivery partners: same move -----
  const partners = await FoodDeliveryPartner.find({ city: 'Gurugram', state: 'Haryana' });
  let partnersMoved = 0;
  for (const p of partners) {
    p.city = 'Lucknow';
    p.state = 'Uttar Pradesh';
    p.address = (p.address || '').replace(/Gurugram/gi, 'Lucknow').replace(/Haryana/gi, 'Uttar Pradesh');
    p.lastLocation = { type: 'Point', coordinates: [80.8 + Math.random() * 0.4, 26.7 + Math.random() * 0.4] };
    await p.save();
    partnersMoved += 1;
  }
  console.log(`   ${partnersMoved} delivery partners moved to Lucknow, Uttar Pradesh`);

  console.log('done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('migration failed:', err);
  process.exitCode = 1;
});
