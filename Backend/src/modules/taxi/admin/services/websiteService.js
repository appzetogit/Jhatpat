import { WebsitePage } from '../models/WebsitePage.js';
import { WEBSITE_DEFAULTS } from '../data/websiteDefaults.js';
import { ApiError } from '../../../../utils/ApiError.js';

const KEY = 'home';
const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v);

/*
 * Objects merge key by key so a field the admin never filled still falls back
 * to its default; arrays (lists of cards/FAQs) are taken as the admin saved
 * them, because "delete one card" must stick.
 */
const mergeDefaults = (defaults, saved) => {
  if (!isPlain(defaults)) return saved === undefined ? defaults : saved;
  const out = { ...defaults };
  if (!isPlain(saved)) return out;
  for (const key of Object.keys(saved)) {
    out[key] = isPlain(defaults[key]) ? mergeDefaults(defaults[key], saved[key]) : saved[key];
  }
  return out;
};

const load = async () => {
  let doc = await WebsitePage.findOne({ key: KEY });
  if (!doc) doc = await WebsitePage.create({ key: KEY, content: WEBSITE_DEFAULTS });
  return doc;
};

export const getWebsiteForAdmin = async () => {
  const doc = await load();
  return {
    content: mergeDefaults(WEBSITE_DEFAULTS, doc.content),
    published: doc.published,
    updatedAt: doc.updatedAt,
  };
};

export const getWebsiteForPublic = async () => {
  const doc = await load();
  if (!doc.published) return { published: false, content: null };
  return { published: true, content: mergeDefaults(WEBSITE_DEFAULTS, doc.content) };
};

const MAX_BYTES = 400 * 1024;

export const saveWebsite = async (payload = {}, adminId = '') => {
  const next = payload.content;
  if (!isPlain(next)) throw new ApiError(400, 'content object is required');
  if (Buffer.byteLength(JSON.stringify(next), 'utf8') > MAX_BYTES) {
    throw new ApiError(413, 'Website content is too large');
  }
  const doc = await load();
  doc.content = next;
  doc.markModified('content');
  if (typeof payload.published === 'boolean') doc.published = payload.published;
  doc.updatedBy = String(adminId || '');
  await doc.save();
  return { content: mergeDefaults(WEBSITE_DEFAULTS, doc.content), published: doc.published, updatedAt: doc.updatedAt };
};

export const resetWebsite = async (adminId = '') => {
  const doc = await load();
  doc.content = WEBSITE_DEFAULTS;
  doc.markModified('content');
  doc.updatedBy = String(adminId || '');
  await doc.save();
  return { content: mergeDefaults(WEBSITE_DEFAULTS, doc.content), published: doc.published, updatedAt: doc.updatedAt };
};
