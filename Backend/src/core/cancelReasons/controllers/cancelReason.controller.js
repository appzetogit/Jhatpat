import { sendResponse } from '../../../utils/response.js';
import {
    validateCancelReasonQuery,
    validateCancelReasonCreateDto,
    validateCancelReasonUpdateDto,
    validateOfferRejectionDto,
} from '../validators/cancelReason.validator.js';
import {
    listActiveReasonsFor,
    listAllReasonsForAdmin,
    createReason,
    updateReason,
    recordOfferRejection,
} from '../services/cancelReason.service.js';

/** GET /platform/cancel-reasons — public, no login. */
export async function getCancelReasonsController(req, res, next) {
    try {
        const { app, action, service } = validateCancelReasonQuery(req.query);
        const data = await listActiveReasonsFor({ app, action, service });
        return sendResponse(res, 200, 'Cancel reasons fetched', data);
    } catch (error) {
        next(error);
    }
}

/** GET /platform/cancel-reasons/admin — admin, all rows (any isActive). */
export async function listCancelReasonsAdminController(req, res, next) {
    try {
        const app = req.query.app ? String(req.query.app).trim().toLowerCase() : null;
        const action = req.query.action ? String(req.query.action).trim().toLowerCase() : null;
        const service = req.query.service ? String(req.query.service).trim().toLowerCase() : null;
        const reasons = await listAllReasonsForAdmin({ app, action, service });
        return sendResponse(res, 200, 'Cancel reasons fetched', { reasons });
    } catch (error) {
        next(error);
    }
}

/** POST /platform/cancel-reasons/admin — admin, add a reason. */
export async function createCancelReasonAdminController(req, res, next) {
    try {
        const dto = validateCancelReasonCreateDto(req.body);
        const reason = await createReason(dto);
        return sendResponse(res, 201, 'Cancel reason created', { reason });
    } catch (error) {
        next(error);
    }
}

/** PATCH /platform/cancel-reasons/admin/:id — admin, edit label/order/active. */
export async function updateCancelReasonAdminController(req, res, next) {
    try {
        const update = validateCancelReasonUpdateDto(req.body);
        const reason = await updateReason(req.params.id, update);
        return sendResponse(res, 200, 'Cancel reason updated', { reason });
    } catch (error) {
        next(error);
    }
}

/** POST /platform/cancel-reasons/rejections — delivery login required. */
export async function createOfferRejectionController(req, res, next) {
    try {
        const { service, jobId, reasonCode, reason } = validateOfferRejectionDto(req.body);
        // The driver comes from the login token, never the body.
        const driverId = req.auth.sub;
        const record = await recordOfferRejection({ driverId, service, jobId, reasonCode, reason });
        return sendResponse(res, 200, 'Rejection reason recorded', { rejection: record });
    } catch (error) {
        next(error);
    }
}
