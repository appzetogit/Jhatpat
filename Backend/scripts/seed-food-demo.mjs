import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Fills the Food admin with demo data: 45 global categories, 20 approved
// restaurants, ~20 items each (~400 total), and a handful of approved
// delivery partners. Images are real food photography from TheMealDB (free,
// no key) and real human-face stock avatars from pravatar.cc (standard for
// non-production test accounts) — reused across many rows rather than
// fetched uniquely per row, which would mean hundreds of near-duplicate
// requests for no real benefit.
//
// Idempotent: every write checks for an existing row by name/phone first.

const { FoodCategory } = await import('../src/modules/food/admin/models/category.model.js');
const { FoodRestaurant } = await import('../src/modules/food/restaurant/models/restaurant.model.js');
const { FoodItem } = await import('../src/modules/food/admin/models/food.model.js');
const { FoodDeliveryPartner } = await import('../src/modules/food/delivery/models/deliveryPartner.model.js');
const { FoodZone } = await import('../src/modules/food/admin/models/zone.model.js');
const { uploadImageBuffer } = await import('../src/services/cloudinary.service.js');

const MEALDB_CATEGORIES_URL = 'https://www.themealdb.com/api/json/v1/1/categories.php';
const MEALDB_FILTER_URL = (c) => `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(c)}`;

/** Download a remote image and re-host it through our own storage, returning an absolute URL. */
const rehost = async (remoteUrl, folder) => {
  const res = await fetch(remoteUrl);
  if (!res.ok) return '';
  const buf = Buffer.from(await res.arrayBuffer());
  const url = await uploadImageBuffer(buf, folder);
  return url.startsWith('http') ? url : `https://jhatpattaxi.com${url}`;
};

// ---- Category names: Indian food-delivery categories, grouped by which
// real-world photo style suits them (so the photo pool reuse looks sane). ----
const CATEGORY_GROUPS = {
  Chicken: ['Chicken Biryani', 'Butter Chicken', 'Chicken Tikka', 'Chicken Curry', 'Tandoori Chicken', 'Chicken Momos'],
  Beef: ['Kebabs', 'Seekh Kebab', 'Mutton Curry', 'Mutton Biryani'],
  Vegetarian: ['Paneer Dishes', 'Veg Biryani', 'Dal & Lentils', 'Veg Curry', 'Veg Momos', 'Salads'],
  Seafood: ['Fish Curry', 'Prawns', 'Fish Fry'],
  Dessert: ['Sweets', 'Ice Cream', 'Cakes & Pastries', 'Gulab Jamun', 'Kulfi'],
  Breakfast: ['South Indian Breakfast', 'Paratha', 'Poha', 'Idli Dosa'],
  Pasta: ['Pasta', 'Italian'],
  Pizza: ['Pizza'],
  Vegan: ['Vegan Bowls', 'Healthy Food'],
  Side: ['Starters', 'Snacks', 'Chaat', 'Rolls & Wraps', 'Sandwiches', 'Burgers', 'French Fries'],
  Soup: ['Soups'],
  Noodles: ['Chinese', 'Noodles', 'Fried Rice'],
  Lamb: ['Rogan Josh', 'Kadhai'],
  Pork: ['BBQ'],
  Goat: ['Goat Curry'],
};

const RESTAURANT_NAMES = [
  'Spice Villa', 'Tandoori Flames', 'Punjabi Rasoi', 'South Spice Express', 'Biryani House',
  'The Curry Leaf', 'Haldi Kitchen', 'Masala Junction', 'Royal Thali', 'Desi Dhaba',
  'Momo Point', 'Pizza Mania', 'Burger Barn', 'The Chinese Wok', 'Sweet Tooth Bakery',
  'Green Leaf Vegan', 'Coastal Catch Seafood', 'Grill & Chill', 'Paratha Palace', 'Cafe Aroma',
];
const CUISINES = [
  ['North Indian', 'Mughlai'], ['North Indian', 'Tandoor'], ['Punjabi'], ['South Indian'], ['Biryani'],
  ['North Indian', 'Curries'], ['North Indian'], ['North Indian', 'Mughlai'], ['North Indian', 'Thali'], ['North Indian', 'Dhaba'],
  ['Tibetan', 'Momos'], ['Italian', 'Pizza'], ['American', 'Burgers'], ['Chinese'], ['Bakery', 'Desserts'],
  ['Vegan', 'Healthy'], ['Seafood'], ['BBQ', 'Grill'], ['North Indian', 'Breakfast'], ['Cafe', 'Continental'],
];

const AREAS = ['Cyber City', 'Sector 29', 'MG Road', 'Sohna Road', 'Sector 14', 'DLF Phase 3', 'Palam Vihar'];

const ITEM_NAME_TEMPLATES = [
  'Classic', 'Special', 'Deluxe', 'Family Pack', 'Mini', 'Chef\'s', 'Spicy', 'Extra Cheese', 'Combo', 'Signature',
  'Half', 'Full', 'Jumbo', 'Regular', 'Premium', 'Homestyle', 'Street Style', 'Royal', 'Tandoori', 'Masala',
];

const DELIVERY_BOY_NAMES = [
  'Ramesh Kumar', 'Suresh Yadav', 'Vijay Singh', 'Anil Sharma', 'Pawan Verma',
  'Rohit Malik', 'Deepak Chauhan', 'Manoj Kumar', 'Sandeep Rana', 'Ajay Dagar',
  'Naveen Kumar', 'Sunil Dutt',
];

const randPrice = (min, max) => Math.round((min + Math.random() * (max - min)) / 10) * 10;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const haryanaZone = await FoodZone.findOne({ name: 'Haryana' });
  if (!haryanaZone) throw new Error('Run seed-haryana-zone.mjs first (Food Zone "Haryana" not found)');

  // ---- Step 1: build a real-photo pool from TheMealDB, one rehost per MealDB category ----
  console.log('==> Building food photo pool from TheMealDB');
  const catRes = await fetch(MEALDB_CATEGORIES_URL);
  const catData = await catRes.json();
  const mealdbCategories = catData.categories || [];

  const photoPool = {}; // mealdbCategoryName -> array of rehosted URLs
  for (const c of mealdbCategories) {
    const filterRes = await fetch(MEALDB_FILTER_URL(c.strCategory));
    const filterData = await filterRes.json();
    const meals = (filterData.meals || []).slice(0, 6);
    const urls = [];
    for (const meal of meals) {
      const url = await rehost(meal.strMealThumb, 'food/items');
      if (url) urls.push(url);
    }
    // Always include the category's own thumbnail too.
    const catThumb = await rehost(c.strCategoryThumb, 'food/categories');
    photoPool[c.strCategory] = { categoryImage: catThumb, items: urls.length ? urls : [catThumb] };
    console.log(`   pool: ${c.strCategory} -> ${urls.length} item photos`);
  }

  // ---- Step 2: categories ----
  console.log('==> Creating categories');
  const categoryDocs = {};
  let categoryCount = 0;
  for (const [mealdbCat, names] of Object.entries(CATEGORY_GROUPS)) {
    const pool = photoPool[mealdbCat] || Object.values(photoPool)[0];
    for (const name of names) {
      let doc = await FoodCategory.findOne({ name, restaurantId: { $exists: false } });
      if (!doc) {
        doc = await FoodCategory.create({
          name, image: pool.categoryImage, type: 'food', foodTypeScope: 'Both',
          approvalStatus: 'approved', isApproved: true, isActive: true, sortOrder: categoryCount,
        });
        categoryCount += 1;
      }
      categoryDocs[name] = doc;
    }
  }
  console.log(`   categories ready: ${Object.keys(categoryDocs).length} (created ${categoryCount} new)`);

  // ---- Step 3: restaurants + items ----
  console.log('==> Creating restaurants and menu items');
  const categoryNames = Object.keys(categoryDocs);
  const mealdbCats = Object.keys(photoPool);
  let restaurantsCreated = 0;
  let itemsCreated = 0;

  for (let i = 0; i < RESTAURANT_NAMES.length; i += 1) {
    const name = RESTAURANT_NAMES[i];
    const cuisines = CUISINES[i];
    let restaurant = await FoodRestaurant.findOne({ restaurantNameNormalized: name.trim().toLowerCase() });

    if (!restaurant) {
      const phone = `98${String(1000000 + i * 37).padStart(8, '0')}`;
      const mealdbCat = mealdbCats[i % mealdbCats.length];
      const coverImage = photoPool[mealdbCat]?.categoryImage || '';
      restaurant = await FoodRestaurant.create({
        restaurantName: name,
        ownerName: `${name} Owner`,
        ownerEmail: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
        ownerPhone: phone,
        primaryContactNumber: phone,
        pureVegRestaurant: cuisines.includes('Vegan'),
        addressLine1: `Shop ${10 + i}, ${pick(AREAS)}`,
        area: pick(AREAS),
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122001',
        cuisines,
        openingTime: '10:00',
        closingTime: '23:00',
        openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isAcceptingOrders: true,
        coverImage,
        profileImage: coverImage,
        location: {
          type: 'Point',
          coordinates: [76.5 + Math.random() * 1.0, 28.0 + Math.random() * 2.5],
        },
        zoneId: haryanaZone._id,
        rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
        totalRatings: Math.floor(50 + Math.random() * 950),
        status: 'approved',
        approvedAt: new Date(),
      });
      restaurantsCreated += 1;
      console.log(`   + restaurant "${name}" (approved)`);
    } else {
      console.log(`   = restaurant "${name}" already exists`);
    }

    // 20 items per restaurant, drawn from 3 categories that suit the cuisine list.
    const existingItemCount = await FoodItem.countDocuments({ restaurantId: restaurant._id });
    if (existingItemCount >= 20) {
      console.log(`     = ${existingItemCount} items already present, skipping`);
      continue;
    }

    const relatedCategoryNames = categoryNames
      .filter((n) => cuisines.some((c) => n.toLowerCase().includes(c.toLowerCase().split(' ')[0])))
      .slice(0, 4);
    const fallbackCategoryNames = relatedCategoryNames.length ? relatedCategoryNames : categoryNames.slice(i % 10, i % 10 + 4);
    const chosenCategoryNames = fallbackCategoryNames.length ? fallbackCategoryNames : [categoryNames[0]];

    const itemsToCreate = 20 - existingItemCount;
    for (let n = 0; n < itemsToCreate; n += 1) {
      const categoryName = chosenCategoryNames[n % chosenCategoryNames.length];
      const category = categoryDocs[categoryName];
      const mealdbCat = mealdbCats[(i + n) % mealdbCats.length];
      const image = pick(photoPool[mealdbCat]?.items || [photoPool[mealdbCat]?.categoryImage]);
      const itemName = `${pick(ITEM_NAME_TEMPLATES)} ${categoryName}`.replace(/\s+/g, ' ').trim();
      const price = randPrice(99, 499);

      await FoodItem.create({
        restaurantId: restaurant._id,
        categoryId: category?._id,
        categoryName,
        name: `${itemName} #${n + 1}`,
        description: `Freshly made ${categoryName.toLowerCase()}, a ${name} favourite.`,
        price,
        basePrice: price,
        image,
        foodType: cuisines.includes('Vegan') || categoryName.toLowerCase().includes('veg') ? 'Veg' : 'Non-Veg',
        isActive: true,
        isAvailable: true,
        approvalStatus: 'approved',
        approvedAt: new Date(),
      });
      itemsCreated += 1;
    }
    console.log(`     + ${itemsToCreate} items created for "${name}"`);
  }
  console.log(`   restaurants created: ${restaurantsCreated}, items created: ${itemsCreated}`);

  // ---- Step 4: delivery partners ----
  console.log('==> Creating delivery partners');
  let partnersCreated = 0;
  for (let i = 0; i < DELIVERY_BOY_NAMES.length; i += 1) {
    const dName = DELIVERY_BOY_NAMES[i];
    const phone = `97${String(2000000 + i * 53).padStart(8, '0')}`;
    const existing = await FoodDeliveryPartner.findOne({ phone });
    if (existing) { console.log(`   = ${dName} already exists`); continue; }

    await FoodDeliveryPartner.create({
      name: dName,
      phone,
      countryCode: '+91',
      city: 'Gurugram',
      state: 'Haryana',
      address: `${pick(AREAS)}, Gurugram, Haryana`,
      driverClass: 'two_wheeler',
      vehicleType: 'bike',
      vehicleName: 'Bike',
      vehicleNumber: `HR26${String(1000 + i).padStart(4, '0')}`,
      profilePhoto: `https://i.pravatar.cc/300?u=jhatpat-delivery-${i + 1}`,
      status: 'approved',
      approvedAt: new Date(),
      zoneIds: [haryanaZone._id],
      lastLocation: { type: 'Point', coordinates: [76.5 + Math.random() * 1.0, 28.0 + Math.random() * 2.5] },
      availabilityStatus: 'offline',
    });
    partnersCreated += 1;
    console.log(`   + delivery partner "${dName}" (approved)`);
  }
  console.log(`   delivery partners created: ${partnersCreated}`);

  console.log('done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err);
  process.exitCode = 1;
});
