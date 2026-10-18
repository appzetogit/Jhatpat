import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// The admin renamed the Food zone from "Uttar Pradesh" to "Sambhal" and
// redrew its boundary directly in the admin panel. This brings everything
// else that was seeded for that zone into line with it, in place (same
// document _ids, so every existing link keeps working):
//
//   - Taxi Zone + ServiceLocation renamed Uttar Pradesh -> Sambhal, with
//     the SAME polygon the admin already drew for the Food zone (read back
//     from the DB, not re-drawn), so both modules agree on one boundary.
//   - FoodZone's own `serviceLocation` display field synced to "Sambhal".
//   - The 20 demo restaurants and 12 demo delivery partners moved from
//     Lucknow to Sambhal.
//   - Taxi's 5 popular places replaced with 5 real Sambhal landmarks.
//
// Re-run-safe: does nothing once the Taxi zone is already named "Sambhal".

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

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

  const taxiZone = await Zone.findOne({ name: 'Uttar Pradesh' });
  if (!taxiZone) {
    console.log('No Taxi Zone named "Uttar Pradesh" found -- already migrated, or never created.');
    await mongoose.disconnect();
    return;
  }

  const foodZone = await FoodZone.findOne({ name: 'Sambhal' });
  if (!foodZone) throw new Error('Food Zone "Sambhal" not found -- rename it in the admin panel first (this script reads its boundary).');

  // ----- Reuse the admin's own Sambhal polygon for the Taxi zone -----
  const ring = foodZone.coordinates.map((pt) => [pt.longitude, pt.latitude]);
  ring.push(ring[0]); // GeoJSON polygons must close.

  const serviceLocation = await ServiceLocation.findOne({ service_location_name: 'Uttar Pradesh' });
  if (serviceLocation) {
    serviceLocation.name = 'Sambhal';
    serviceLocation.service_location_name = 'Sambhal';
    serviceLocation.address = 'Sambhal, Uttar Pradesh, India';
    await serviceLocation.save();
    console.log('ServiceLocation renamed Uttar Pradesh -> Sambhal');
  }

  taxiZone.name = 'Sambhal';
  taxiZone.geometry = { type: 'Polygon', coordinates: [ring] };

  console.log('==> Replacing popular places with real Sambhal landmarks');
  const candidates = [
    { name: 'Shahi Jama Masjid', query: 'Shahi Jama Masjid, Sambhal' },
    { name: 'Sambhal Railway Station', query: 'Sambhal Hatim Sarai Railway Station' },
    { name: 'Shri Kalki Vishnu Temple', query: 'Kalki Vishnu Mandir, Sambhal' },
    { name: 'Sambhal Bus Stand', query: 'Roadways Bus Stand, Sambhal' },
    { name: 'Sarai Tareen Market', query: 'Sarai Tareen, Sambhal' },
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
  console.log('Taxi Zone renamed Uttar Pradesh -> Sambhal, boundary synced from Food zone, popular places replaced');

  // ----- Sync the Food zone's own display field -----
  await FoodZone.updateOne({ _id: foodZone._id }, { $set: { serviceLocation: 'Sambhal' } });
  console.log('Food Zone "serviceLocation" display field synced to Sambhal');

  // ----- Move the demo restaurants + delivery partners from Lucknow to Sambhal -----
  const SAMBHAL_CENTER = { lat: 28.5903614, lng: 78.5717631 };
  const restaurants = await FoodRestaurant.find({ city: 'Lucknow', state: 'Uttar Pradesh' });
  let restaurantsMoved = 0;
  for (const r of restaurants) {
    r.city = 'Sambhal';
    r.pincode = '244302';
    if (r.area) r.area = r.area.replace(/Lucknow/gi, 'Sambhal');
    r.location = {
      type: 'Point',
      coordinates: [SAMBHAL_CENTER.lng + (Math.random() - 0.5) * 0.05, SAMBHAL_CENTER.lat + (Math.random() - 0.5) * 0.05],
    };
    await r.save();
    restaurantsMoved += 1;
  }
  console.log(`${restaurantsMoved} restaurants moved to Sambhal, Uttar Pradesh`);

  const partners = await FoodDeliveryPartner.find({ city: 'Lucknow', state: 'Uttar Pradesh' });
  let partnersMoved = 0;
  for (const p of partners) {
    p.city = 'Sambhal';
    p.address = (p.address || '').replace(/Lucknow/gi, 'Sambhal');
    p.lastLocation = {
      type: 'Point',
      coordinates: [SAMBHAL_CENTER.lng + (Math.random() - 0.5) * 0.05, SAMBHAL_CENTER.lat + (Math.random() - 0.5) * 0.05],
    };
    await p.save();
    partnersMoved += 1;
  }
  console.log(`${partnersMoved} delivery partners moved to Sambhal, Uttar Pradesh`);

  console.log('done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('migration failed:', err);
  process.exitCode = 1;
});
