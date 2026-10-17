import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Fills the safe, non-financial config singletons across Food and Master so
// their admin pages are not blank. Deliberately leaves alone anything that
// is a real financial/business decision an admin must set themselves
// (delivery fee amounts, commission percentages, API keys/secrets) -- same
// reasoning as why the Haryana fare rows were seeded inactive at ₹0 rather
// than guessed: a wrong number here charges real money or breaks a real
// integration, where a placeholder paragraph of legal text does not.
//
// Idempotent: upsert with $setOnInsert.

const { FoodBusinessSettings } = await import('../src/modules/food/admin/models/businessSettings.model.js');
const { FoodPageContent } = await import('../src/modules/food/admin/models/pageContent.model.js');
const { FoodDeliveryCashLimit } = await import('../src/modules/food/admin/models/deliveryCashLimit.model.js');
const { PlatformProfile } = await import('../src/core/settings/platformProfile.model.js');
const { AppServicesState } = await import('../src/core/appServices/appServices.model.js');

const LEGAL_PLACEHOLDER = (title) =>
  `<h2>${title}</h2><p>This is placeholder ${title.toLowerCase()} content. Replace it with Jhatpat's actual policy before going live.</p>`;

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  // ---- Food: business settings (singleton, no scope field -- just ensure one exists) ----
  const businessCount = await FoodBusinessSettings.countDocuments();
  if (businessCount === 0) {
    await FoodBusinessSettings.create({
      companyName: 'Jhatpat',
      email: 'admin@jhatpattaxi.com',
      phone: { countryCode: '+91', number: '7358789910' },
      address: 'Jhatpat, Siliguri, West Bengal, India',
      state: 'West Bengal',
      region: 'India',
    });
    console.log('+ FoodBusinessSettings created');
  } else {
    console.log('= FoodBusinessSettings already exists');
  }

  // ---- Food: legal/about/help pages ----
  const pages = [
    ['terms', { legal: { title: 'Terms & Conditions', content: LEGAL_PLACEHOLDER('Terms & Conditions') } }],
    ['privacy', { legal: { title: 'Privacy Policy', content: LEGAL_PLACEHOLDER('Privacy Policy') } }],
    ['refund', { legal: { title: 'Refund Policy', content: LEGAL_PLACEHOLDER('Refund Policy') } }],
    ['shipping', { legal: { title: 'Shipping Policy', content: LEGAL_PLACEHOLDER('Shipping Policy') } }],
    ['cancellation', { legal: { title: 'Cancellation Policy', content: LEGAL_PLACEHOLDER('Cancellation Policy') } }],
    ['terms_restaurant', { legal: { title: 'Restaurant Terms', content: LEGAL_PLACEHOLDER('Restaurant Terms') } }],
    ['privacy_restaurant', { legal: { title: 'Restaurant Privacy Policy', content: LEGAL_PLACEHOLDER('Restaurant Privacy Policy') } }],
    ['terms_delivery', { legal: { title: 'Delivery Partner Terms', content: LEGAL_PLACEHOLDER('Delivery Partner Terms') } }],
    ['privacy_delivery', { legal: { title: 'Delivery Partner Privacy Policy', content: LEGAL_PLACEHOLDER('Delivery Partner Privacy Policy') } }],
    ['about', {
      about: {
        appName: 'Jhatpat', version: '1.0.0',
        description: 'Jhatpat is your on-demand platform for food delivery and taxi rides.',
        features: [
          { icon: 'Clock', title: 'Fast Delivery', description: 'Get your order quickly, every time.', order: 1 },
          { icon: 'ShieldCheck', title: 'Safe & Reliable', description: 'Verified restaurants and drivers.', order: 2 },
          { icon: 'Heart', title: 'Loved by Customers', description: 'Thousands of happy orders and rides.', order: 3 },
        ],
      },
    }],
    ['help_support', {
      help_support: {
        title: 'Help & Support', description: 'We are here to help you.',
        contactEmail: 'support@jhatpattaxi.com', contactPhone: '+917358789910',
        categories: [
          { title: 'Orders', icon: 'Package', faqs: [{ question: 'How do I track my order?', answer: 'Open My Orders and tap the active order to see live status.' }] },
          { title: 'Rides', icon: 'Car', faqs: [{ question: 'How do I cancel a ride?', answer: 'Open the active ride screen and tap Cancel.' }] },
        ],
      },
    }],
  ];
  for (const [key, doc] of pages) {
    const res = await FoodPageContent.updateOne({ key }, { $setOnInsert: { key, ...doc } }, { upsert: true, runValidators: true });
    console.log(res.upsertedCount ? `+ FoodPageContent "${key}" created` : `= FoodPageContent "${key}" already exists`);
  }

  // ---- Food: delivery cash limit (only if none active yet) ----
  const cashLimitExists = await FoodDeliveryCashLimit.findOne({ isActive: true });
  if (!cashLimitExists) {
    await FoodDeliveryCashLimit.create({ deliveryCashLimit: 2000, deliveryWithdrawalLimit: 100, isActive: true });
    console.log('+ FoodDeliveryCashLimit created (₹2000, admin should review)');
  } else {
    console.log('= FoodDeliveryCashLimit already exists');
  }

  // ---- Master: PlatformProfile (brand/contact/business/legal only -- never invent integration secrets) ----
  let profile = await PlatformProfile.findById('platform');
  if (!profile) {
    profile = await PlatformProfile.create({
      _id: 'platform',
      brand: { name: 'Jhatpat' },
      contact: {
        email: 'admin@jhatpattaxi.com', phoneCountryCode: '+91', phone: '7358789910',
        address: 'Jhatpat, Siliguri, West Bengal, India', city: 'Siliguri', state: 'West Bengal',
      },
      business: { legalName: 'Jhatpat', currencyCode: 'INR', currencySymbol: '₹' },
      legal: {
        terms: LEGAL_PLACEHOLDER('Terms & Conditions'),
        privacy: LEGAL_PLACEHOLDER('Privacy Policy'),
        refund: LEGAL_PLACEHOLDER('Refund Policy'),
        cancellation: LEGAL_PLACEHOLDER('Cancellation Policy'),
        shipping: LEGAL_PLACEHOLDER('Shipping Policy'),
      },
    });
    console.log('+ PlatformProfile (Master brand/contact/legal) created');
  } else {
    console.log('= PlatformProfile already exists');
  }

  // ---- Master: AppServicesState (both services on) ----
  let appServices = await AppServicesState.findById('platform');
  if (!appServices) {
    appServices = await AppServicesState.create({
      _id: 'platform',
      services: new Map([
        ['food', { enabled: true, updatedBy: 'seed-script', updatedAt: new Date() }],
        ['taxi', { enabled: true, updatedBy: 'seed-script', updatedAt: new Date() }],
      ]),
    });
    console.log('+ AppServicesState created (food + taxi enabled)');
  } else {
    console.log('= AppServicesState already exists');
  }

  console.log('\nSkipped on purpose (real money/integration decisions only an admin should make):');
  console.log('  - Food fee/commission settings (delivery fee, platform fee, commission %)');
  console.log('  - Platform integration secrets (Razorpay, SMS, email credentials)');

  console.log('done.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err);
  process.exitCode = 1;
});
