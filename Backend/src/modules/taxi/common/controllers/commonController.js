import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { uploadDataUrlToCloudinary, uploadBufferToCloudinary } from '../../../../utils/cloudinaryUpload.js';
import { env } from '../../../../config/env.js';
import { AdminAppSetting } from '../../admin/models/AdminAppSetting.js';
import { AdminBusinessSetting } from '../../admin/models/AdminBusinessSetting.js';
import { createDefaultAppSettings } from '../../admin/data/defaultAppSettings.js';
import { createDefaultBusinessSettings } from '../../admin/data/defaultBusinessSettings.js';
import { getReferralSettings, getReferralTranslationContent } from '../../admin/services/adminService.js';
import { getPublicActivePaymentGateway } from '../../services/paymentGatewayService.js';
import { LandingPageSetting } from '../../admin/models/LandingPageSetting.js';

/**
 * Common controller for shared utilities like file uploads
 */
export const uploadImage = asyncHandler(async (req, res) => {
    const folder = String(req.body?.folder || 'general').trim() || 'general';
    const scopedFolder = `${env.cloudinary.folder}/${folder}`;
    const publicIdPrefix = `content-${folder}`;

    const uploadResult = req.file
        ? await uploadBufferToCloudinary({
            buffer: req.file.buffer,
            mimeType: req.file.mimetype || 'image/jpeg',
            folder: scopedFolder,
            publicIdPrefix,
            // Keep original format for faster selfie uploads.
            format: undefined,
        })
        : await uploadDataUrlToCloudinary({
            dataUrl: req.body?.image,
            folder: scopedFolder,
            publicIdPrefix,
            format: undefined,
        });

    return res.json({
        success: true,
        data: {
            url: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            format: uploadResult.format
        }
    });
});

export const getReferralTranslation = asyncHandler(async (req, res) => {
    const languageCode = String(req.query?.language || req.query?.lang || '').trim().toLowerCase();
    const data = await getReferralTranslationContent(languageCode);

    return res.json({
        success: true,
        data,
    });
});

export const getReferralSettingsContent = asyncHandler(async (req, res) => {
    const type = String(req.query?.type || '').trim().toLowerCase();
    const data = await getReferralSettings(type || undefined);

    return res.json({
        success: true,
        data,
    });
});

export const getPaymentGatewayConfig = asyncHandler(async (_req, res) => {
    const data = await getPublicActivePaymentGateway();

    return res.json({
        success: true,
        data,
    });
});

export const getPublicSettingsBootstrap = asyncHandler(async (_req, res) => {
    const [businessSettings, appSettings, paymentGateway] = await Promise.all([
        AdminBusinessSetting.findOne({ scope: 'default' })
            .select('general customization transport_ride bid_ride')
            .lean(),
        AdminAppSetting.findOne({ scope: 'default' })
            .select('wallet_setting tip_setting country')
            .lean(),
        getPublicActivePaymentGateway(),
    ]);

    const defaultBusinessSettings = createDefaultBusinessSettings();
    const defaultAppSettings = createDefaultAppSettings();

    return res.json({
        success: true,
        data: {
            general: {
                ...(defaultBusinessSettings.general || {}),
                ...(businessSettings?.general || {}),
            },
            customization: {
                ...(defaultBusinessSettings.customization || {}),
                ...(businessSettings?.customization || {}),
            },
            transportRide: {
                ...(defaultBusinessSettings.transport_ride || {}),
                ...(businessSettings?.transport_ride || {}),
            },
            bidRide: {
                ...(defaultBusinessSettings.bid_ride || {}),
                ...(businessSettings?.bid_ride || {}),
            },
            wallet: {
                ...(defaultAppSettings.wallet_setting || {}),
                ...(appSettings?.wallet_setting || {}),
            },
            tip: {
                ...(defaultAppSettings.tip_setting || {}),
                ...(appSettings?.tip_setting || {}),
            },
            country: {
                ...(defaultAppSettings.country || {}),
                ...(appSettings?.country || {}),
            },
            paymentGateway: paymentGateway?.activeGateway || null,
        },
    });
});

export const acknowledgePhonePeCallback = asyncHandler(async (_req, res) => {
    return res.json({
        success: true,
        message: 'Callback received',
    });
});

export const getLandingPageSettings = asyncHandler(async (_req, res) => {
    let settings = await LandingPageSetting.findOne({ scope: 'default' }).lean();
    if (!settings) {
        // First read: seed the About / Careers / Newsroom / legal text the apps and
        // the /taxi/* static pages show. The website home page has its own editor.
        const created = await LandingPageSetting.create({
            scope: 'default',
            pages: {
                about_us: '<h1>About Jhatpat</h1><p>Jhatpat is a leading technology platform dedicated to providing safe, reliable, and affordable mobility solutions for everyone. Our mission is to transform urban transportation and logistics by connecting people with professional drivers and efficient services.</p>',
                careers: '<h1>Careers at Jhatpat</h1><p>Join our team and build the future of urban mobility. We are constantly looking for talented software engineers, product managers, driver relationship experts, and support specialists to join our journey.</p>',
                newsroom: '<h1>Jhatpat Newsroom</h1><p>Stay updated with our latest press releases, company announcements, service launches, and regulatory breakthroughs. Jhatpat is growing quickly to serve more cities across Bharat.</p>',
                terms_conditions: '<h1>Terms of Service</h1><p>By using Jhatpat app or website, you agree to these Terms of Service. Jhatpat acts as a technology platform connecting users with third-party service providers. You must provide accurate details and use the platform lawfully.</p>',
                privacy_policy: '<h1>Privacy Policy</h1><p>We value your privacy. Jhatpat collects your personal information (name, contact, location) solely to match and execute rides, deliveries, and orders. We do not sell your personal data to advertisers.</p>',
                refund_policy: '<h1>Refund Policy</h1><p>Refunds are processed for verified overcharges or cancelled bookings prior to partner dispatch. UPI and wallet refunds settle within 1 to 3 days, and bank cards settle in 5 to 10 days.</p>',
                cancellation_policy: '<h1>Cancellation Policy</h1><p>Users may cancel bookings free of charge before a driver accepts. Nominal cancellation charges apply once a driver is assigned or dispatch preparation has already started.</p>'
            }
        });
        settings = created.toObject();
    }

    const pages = await overlayManagedLegal(settings.pages);
    return res.json({ success: true, data: { pages } });
});

/*
 * Taxi's legal text, from Master when Master has it.
 *
 * This was the fourth place legal was written and the only one outside the
 * platform chain: editing Terms in Master left the taxi site and app showing
 * whatever the landing CMS held, with nothing on either screen saying so.
 *
 * Now the same precedence as everywhere else -- the taxi app's own page, then
 * the platform-wide one, then this CMS. The CMS keeps working and stays the
 * fallback, so nothing changes until a page is set in Master.
 */
const MANAGED_LEGAL = Object.freeze([
    ['terms_conditions', 'terms'],
    ['privacy_policy', 'privacy'],
    ['refund_policy', 'refund'],
    ['cancellation_policy', 'cancellation'],
    ['about_us', 'about'],
]);

async function overlayManagedLegal(pages) {
    const out = { ...(pages || {}) };
    try {
        const { resolveAppLegalPage } = await import('../../../../core/settings/appLegal.js');
        await Promise.all(MANAGED_LEGAL.map(async ([cmsKey, kind]) => {
            const managed = await resolveAppLegalPage('taxi_user', kind);
            if (managed?.content?.trim()) out[cmsKey] = managed.content;
        }));
    } catch (err) {
        // The landing page must still render if settings cannot be read.
        console.warn(`[taxi landing] managed legal unavailable: ${err.message}`);
    }
    return out;
}

export const getPublicWebsite = asyncHandler(async (_req, res) => {
    const { getWebsiteForPublic } = await import('../../admin/services/websiteService.js');
    res.set('Cache-Control', 'public, max-age=60');
    return res.json({ success: true, data: await getWebsiteForPublic() });
});
