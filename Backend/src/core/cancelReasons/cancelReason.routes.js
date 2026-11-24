import express from 'express';
import { authMiddleware } from '../auth/auth.middleware.js';
import { requireRoles } from '../roles/role.middleware.js';
import { authenticate as authenticateTaxi } from '../../modules/taxi/middlewares/authMiddleware.js';
import {
    getCancelReasonsController,
    listCancelReasonsAdminController,
    createCancelReasonAdminController,
    updateCancelReasonAdminController,
    createOfferRejectionController,
} from './controllers/cancelReason.controller.js';

/**
 * Mounted at /v1/platform/cancel-reasons. Not under a vertical's /admin
 * prefix: one list serves the User app's food/ride/parcel/service screens and
 * the Delivery app's cancel/reject screens, the same reasoning as
 * /v1/platform/settings and /v1/platform/modules.
 *
 * Declared before any admin sub-route so /admin and /rejections are never
 * swallowed by a param route (there are none here, but keeping the public
 * GET first matches the rest of this router family).
 */
const router = express.Router();

// Public: no login, no private data -- read by both apps before the person
// has necessarily signed in (the reason sheet is part of cancelling).
router.get('/', getCancelReasonsController);

// Admin: shared platform admin login, like /v1/platform/settings.
router.get('/admin', authMiddleware, requireRoles('ADMIN'), listCancelReasonsAdminController);
router.post('/admin', authMiddleware, requireRoles('ADMIN'), createCancelReasonAdminController);
router.patch('/admin/:id', authMiddleware, requireRoles('ADMIN'), updateCancelReasonAdminController);

// Delivery app only: reject reason, sent as its own call after the reject
// itself. authenticateTaxi(['driver']) already bridges a food-issued
// DELIVERY_PARTNER token to its linked taxi Driver id (driverIdentityBridge.js),
// so this one route covers a food rider, a ride driver and a parcel driver
// alike -- req.auth.sub is always the taxi Driver id.
router.post('/rejections', authenticateTaxi(['driver']), createOfferRejectionController);

export default router;
