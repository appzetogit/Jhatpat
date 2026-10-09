import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Seeds the remaining taxi admin sections so every panel page has rows to show.
// Every upsert uses $setOnInsert keyed by a natural key, so re-running never
// duplicates rows and never overwrites values the admin edited later.
//
// Price-related rows (fares, surge, insurance, subscriptions) are seeded as
// INACTIVE. They charge real customers, so the admin switches them on with
// real numbers. Operational records (owners, drivers, vehicles, stores, routes,
// polygons, trips, users) are never seeded.

const load = async (path, name) => {
  const mod = await import(path);
  const model = mod.default ?? mod[name];
  if (!model) throw new Error(`model ${name} not found in ${path}`);
  return model;
};

const adminDefaults = async (file, fn) => (await import(file))[fn]();

const dir = '../src/modules/taxi/admin';

const MODELS = {
  Vehicle: await load(`${dir}/models/Vehicle.js`, 'Vehicle'),
  ServiceLocation: await load(`${dir}/models/ServiceLocation.js`, 'ServiceLocation'),
  SetPrice: await load(`${dir}/models/SetPrice.js`, 'SetPrice'),
  SurgeSlot: await load(`${dir}/models/SurgeSlot.js`, 'SurgeSlot'),
  RideInsurancePlan: await load(`${dir}/models/RideInsurancePlan.js`, 'RideInsurancePlan'),
  SubscriptionPlan: await load(`${dir}/models/SubscriptionPlan.js`, 'SubscriptionPlan'),
  PaymentGateway: await load(`${dir}/models/PaymentGateway.js`, 'PaymentGateway'),
  PaymentMethod: await load(`${dir}/models/PaymentMethod.js`, 'PaymentMethod'),
  OnboardingScreen: await load(`${dir}/models/OnboardingScreen.js`, 'OnboardingScreen'),
  ReferralTranslation: await load(`${dir}/models/ReferralTranslation.js`, 'ReferralTranslation'),
  RideModule: await load(`${dir}/models/RideModule.js`, 'RideModule'),
  UserPreference: await load(`${dir}/models/UserPreference.js`, 'UserPreference'),
  NotificationChannel: await load(`${dir}/models/NotificationChannel.js`, 'NotificationChannel'),
  OwnerNeededDocument: await load(`${dir}/models/OwnerNeededDocument.js`, 'OwnerNeededDocument'),
  LandingPageSetting: await load(`${dir}/models/LandingPageSetting.js`, 'LandingPageSetting'),
  AdminBusinessSetting: await load(`${dir}/models/AdminBusinessSetting.js`, 'AdminBusinessSetting'),
  AdminAppSetting: await load(`${dir}/models/AdminAppSetting.js`, 'AdminAppSetting'),
  AdminThirdPartySetting: await load(`${dir}/models/AdminThirdPartySetting.js`, 'AdminThirdPartySetting'),
  AdminPanelState: await load(`${dir}/models/AdminPanelState.js`, 'AdminPanelState'),
};

const SINGLETONS = [
  ['AdminBusinessSetting', 'createDefaultBusinessSettings', 'data/defaultBusinessSettings.js'],
  ['AdminAppSetting', 'createDefaultAppSettings', 'data/defaultAppSettings.js'],
  ['AdminThirdPartySetting', 'createDefaultThirdPartySettings', 'data/defaultThirdPartySettings.js'],
  ['AdminPanelState', 'createDefaultAdminState', 'data/defaultAdminState.js'],
];

const STATIC_ROWS = [
  // Subscriptions: inactive until the admin sets real prices.
  ['SubscriptionPlan', { name: 'Daily Pass', audience: 'driver' }, {
    audience: 'driver', name: 'Daily Pass', description: '1 day access', amount: 49, duration: 1,
    transport_type: 'taxi', benefit_type: 'unlimited', ride_limit: 0, active: false,
  }],
  ['SubscriptionPlan', { name: 'Monthly Pass', audience: 'driver' }, {
    audience: 'driver', name: 'Monthly Pass', description: '30 days access', amount: 499, duration: 30,
    transport_type: 'taxi', benefit_type: 'unlimited', ride_limit: 0, active: false,
  }],
  ['SubscriptionPlan', { name: 'Jhatpat Plus', audience: 'user' }, {
    audience: 'user', name: 'Jhatpat Plus', description: 'Discounted rides for 30 days', amount: 99, duration: 30,
    transport_type: 'taxi', benefit_type: 'limited', ride_limit: 10, active: false,
  }],

  ['RideInsurancePlan', { name: 'Standard Ride Cover' }, {
    name: 'Standard Ride Cover', description: 'Covers medical costs during a ride', provider: '',
    cover_amount: 100000, premium_type: 'flat', premium_value: 10, sort_order: 1, active: false,
  }],

  ['SurgeSlot', { start_time: '08:00', end_time: '10:00' }, {
    name: 'Morning Peak', start_time: '08:00', end_time: '10:00', percent: 20, active: false,
  }],
  ['SurgeSlot', { start_time: '18:00', end_time: '21:00' }, {
    name: 'Evening Peak', start_time: '18:00', end_time: '21:00', percent: 25, active: false,
  }],

  ['PaymentGateway', { slug: 'razorpay' }, { name: 'Razorpay', slug: 'razorpay', active: true }],
  ['PaymentGateway', { slug: 'cash' }, { name: 'Cash', slug: 'cash', active: true }],
  ['PaymentGateway', { slug: 'wallet' }, { name: 'Wallet', slug: 'wallet', active: true }],
  ['PaymentGateway', { slug: 'stripe' }, { name: 'Stripe', slug: 'stripe', active: false }],

  ['PaymentMethod', { name: 'Cash' }, { name: 'Cash', fields: [], active: true }],
  ['PaymentMethod', { name: 'UPI' }, {
    name: 'UPI',
    fields: [{ type: 'text', name: 'upi_id', placeholder: 'yourname@bank', is_required: true }],
    active: true,
  }],

  ['OnboardingScreen', { audience: 'user', screen: 'welcome' }, {
    audience: 'user', screen: 'welcome', order: 1, title: 'Welcome to Jhatpat', description: 'Book a ride in seconds.',
  }],
  ['OnboardingScreen', { audience: 'user', screen: 'safety' }, {
    audience: 'user', screen: 'safety', order: 2, title: 'Ride safe', description: 'Share your trip and use SOS anytime.',
  }],
  ['OnboardingScreen', { audience: 'driver', screen: 'welcome' }, {
    audience: 'driver', screen: 'welcome', order: 1, title: 'Drive with Jhatpat', description: 'Earn on your own schedule.',
  }],
  ['OnboardingScreen', { audience: 'owner', screen: 'welcome' }, {
    audience: 'owner', screen: 'welcome', order: 1, title: 'Manage your fleet', description: 'Track vehicles and earnings.',
  }],

  ['ReferralTranslation', { language_code: 'en' }, {
    language_code: 'en', language_name: 'English',
    user_referral: { instant_referrer_user: 'Invite friends and earn credits', banner_text: 'Refer & earn' },
    driver_referral: { instant_referrer_user: 'Invite drivers and earn bonus', banner_text: 'Refer & earn' },
  }],
  ['ReferralTranslation', { language_code: 'hi' }, {
    language_code: 'hi', language_name: 'Hindi',
    user_referral: { instant_referrer_user: 'दोस्तों को बुलाएं और क्रेडिट कमाएं', banner_text: 'रेफर करें और कमाएं' },
    driver_referral: { instant_referrer_user: 'ड्राइवर बुलाएं और बोनस पाएं', banner_text: 'रेफर करें और कमाएं' },
  }],

  ['RideModule', { transport_type: 'taxi' }, { transport_type: 'taxi', active: true }],
  ['RideModule', { transport_type: 'delivery' }, { transport_type: 'delivery', active: true }],

  ...['AC', 'Pet Friendly', 'Music', 'Luggage Space'].map((name) => ['UserPreference', { name }, {
    name, icon: '', active: 1,
  }]),

  ['NotificationChannel', { topic_name: 'ride_updates' }, {
    name: 'Ride Updates', topic_name: 'ride_updates', description: 'Booking and trip status', for_user: true,
  }],
  ['NotificationChannel', { topic_name: 'promotions' }, {
    name: 'Promotions', topic_name: 'promotions', description: 'Offers and promo codes', for_user: true,
  }],
  ['NotificationChannel', { topic_name: 'driver_alerts' }, {
    name: 'Driver Alerts', topic_name: 'driver_alerts', description: 'New requests and earnings', for_user: false,
  }],

  ...[
    ['Owner Aadhaar Card', 'front_back', false, true],
    ['Owner PAN Card', 'front', false, true],
    ['Business Registration', 'front', true, false],
  ].map(([name, imageType, hasExpiry, hasIdNumber]) => ['OwnerNeededDocument', { name }, {
    name, image_type: imageType, has_expiry_date: hasExpiry, has_identify_number: hasIdNumber,
    is_editable: false, is_required: true, active: true,
  }]),

  ['LandingPageSetting', { scope: 'default' }, {
    scope: 'default', hero_title: 'Ride with Jhatpat',
    hero_description: 'Taxi, rentals and deliveries in your city.',
    hero_image_url: '/hero2.png', why_us_image_url: '/food/taxi1.jpeg',
  }],
];

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const results = { created: 0, existing: 0, failed: 0 };
  const upsert = async (modelName, key, doc) => {
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
  };

  for (const [modelName, key, doc] of STATIC_ROWS) await upsert(modelName, key, doc);

  // Settings singletons come from the same defaults the admin panel falls back to.
  for (const [modelName, fn, file] of SINGLETONS) {
    const defaults = await adminDefaults(`../src/modules/taxi/admin/${file}`, fn);
    await upsert(modelName, { scope: 'default' }, { scope: 'default', ...defaults });
  }

  // Per vehicle type × service city fare rows, inactive until real rates are set.
  const vehicles = await MODELS.Vehicle.find({ active: true }).lean();
  const cities = await MODELS.ServiceLocation.find({}).lean();
  for (const city of cities) {
    for (const vehicle of vehicles) {
      await upsert('SetPrice',
        { pricing_scope: 'ride', transport_type: 'taxi', vehicle_type: vehicle._id, service_location_id: city._id },
        {
          service_location_id: city._id, vehicle_type: vehicle._id, pricing_scope: 'ride', transport_type: 'taxi',
          base_price: 0, base_distance: 0, price_per_distance: 0, time_price: 0, waiting_charge: 0,
          status: 'inactive', active: 0, order_number: 1,
        });
    }
  }

  console.log(`done — created ${results.created}, already present ${results.existing}, failed ${results.failed}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err.message);
  process.exitCode = 1;
});
