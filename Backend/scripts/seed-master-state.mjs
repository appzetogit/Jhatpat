import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const SERVICES = ['food', 'taxi'];
const MODULES = ['food', 'taxi'];

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date();

  const enabled = (ids) => Object.fromEntries(ids.map((id) => [id, { enabled: true, updatedBy: 'seed', updatedAt: now }]));
  const moduleEnabled = (ids) => Object.fromEntries(ids.map((id) => [id, { enabled: true, reason: '', disabledAt: null, disabledBy: '' }]));

  const appServices = await db.collection('platform_app_services').updateOne(
    { _id: 'platform' },
    { $setOnInsert: { services: enabled(SERVICES), zoneRules: [], createdAt: now, updatedAt: now } },
    { upsert: true },
  );
  const moduleState = await db.collection('platform_module_state').updateOne(
    { _id: 'platform' },
    { $setOnInsert: { modules: moduleEnabled(MODULES), createdAt: now, updatedAt: now } },
    { upsert: true },
  );

  console.log(`platform_app_services: ${appServices.upsertedCount ? 'created' : 'already present'}`);
  console.log(`platform_module_state: ${moduleState.upsertedCount ? 'created' : 'already present'}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('seed failed:', err.message);
  process.exitCode = 1;
});
