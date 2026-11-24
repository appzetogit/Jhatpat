import { ApiError } from '../../../utils/ApiError.js';

const APPS = ['user', 'delivery'];
const ACTIONS = ['cancel', 'reject'];
const SERVICES = ['food', 'ride', 'parcel', 'service', 'scheduled_ride'];
const MAX_REASON_LENGTH = 200;

export function validateCancelReasonQuery(query = {}) {
    const app = String(query.app || '').trim().toLowerCase();
    const action = String(query.action || '').trim().toLowerCase();
    const service = String(query.service || '').trim().toLowerCase();

    if (!APPS.includes(app)) throw new ApiError(400, `app must be one of: ${APPS.join(', ')}`);
    if (!ACTIONS.includes(action)) throw new ApiError(400, `action must be one of: ${ACTIONS.join(', ')}`);
    if (!SERVICES.includes(service)) throw new ApiError(400, `service must be one of: ${SERVICES.join(', ')}`);

    return { app, action, service };
}

export function validateCancelReasonCreateDto(body = {}) {
    const { app, action, service } = validateCancelReasonQuery(body);

    const code = String(body.code || '').trim().toLowerCase();
    if (!code) throw new ApiError(400, 'code is required');
    if (code === 'other') throw new ApiError(400, '"other" is reserved -- both apps add it themselves');

    const label = String(body.label || '').trim();
    if (!label) throw new ApiError(400, 'label is required');

    return {
        app,
        action,
        service,
        code,
        label,
        labelHi: String(body.labelHi || '').trim(),
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0,
        isActive: body.isActive !== false,
    };
}

export function validateCancelReasonUpdateDto(body = {}) {
    const update = {};
    // code is deliberately not editable here -- it's the identity old
    // cancellations/rejections point back to.
    if (body.label !== undefined) {
        const label = String(body.label || '').trim();
        if (!label) throw new ApiError(400, 'label cannot be empty');
        update.label = label;
    }
    if (body.labelHi !== undefined) update.labelHi = String(body.labelHi || '').trim();
    if (body.sortOrder !== undefined) {
        const sortOrder = Number(body.sortOrder);
        if (!Number.isFinite(sortOrder)) throw new ApiError(400, 'sortOrder must be a number');
        update.sortOrder = Math.round(sortOrder);
    }
    if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);

    if (Object.keys(update).length === 0) {
        throw new ApiError(400, 'Nothing to update');
    }

    return update;
}

/** Shared by every cancel/reject save point: { reasonCode, reason }. */
export function normalizeReasonInput(body = {}) {
    const reasonCode = String(body.reasonCode || '').trim().toLowerCase();
    const reason = String(body.reason || '').trim().slice(0, MAX_REASON_LENGTH);
    return { reasonCode, reason };
}

export function validateOfferRejectionDto(body = {}) {
    const service = String(body.service || '').trim().toLowerCase();
    if (!['food', 'ride', 'parcel'].includes(service)) {
        throw new ApiError(400, 'service must be one of: food, ride, parcel');
    }
    const jobId = String(body.jobId || '').trim();
    if (!jobId) throw new ApiError(400, 'jobId is required');

    const { reasonCode, reason } = normalizeReasonInput(body);
    return { service, jobId, reasonCode, reason };
}
