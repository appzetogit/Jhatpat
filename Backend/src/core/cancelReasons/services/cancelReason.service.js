import mongoose from 'mongoose';
import { CancelReason } from '../models/cancelReason.model.js';
import { OfferRejection } from '../models/offerRejection.model.js';
import { ApiError } from '../../../utils/ApiError.js';

// Matches today's screens: every reason sheet has its own "Other" row except
// the delivery app's scheduled-ride cancel screen.
const allowsOther = (service) => service !== 'scheduled_ride';

export async function listActiveReasonsFor({ app, action, service }) {
    const reasons = await CancelReason.find({ app, action, service, isActive: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .select('code label labelHi sortOrder')
        .lean();

    return {
        reasons: reasons.map((r) => ({
            code: r.code,
            label: r.label,
            labelHi: r.labelHi || '',
            sortOrder: r.sortOrder,
        })),
        allowOther: allowsOther(service),
    };
}

export async function listAllReasonsForAdmin({ app, action, service }) {
    const filter = {};
    if (app) filter.app = app;
    if (action) filter.action = action;
    if (service) filter.service = service;

    return CancelReason.find(filter).sort({ app: 1, action: 1, service: 1, sortOrder: 1 }).lean();
}

export async function createReason(dto) {
    try {
        return await CancelReason.create(dto);
    } catch (err) {
        if (err?.code === 11000) {
            throw new ApiError(409, `A reason with code "${dto.code}" already exists for ${dto.app}/${dto.action}/${dto.service}`);
        }
        throw err;
    }
}

export async function updateReason(id, update) {
    const reason = await CancelReason.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!reason) throw new ApiError(404, 'Cancel reason not found');
    return reason;
}

/**
 * Looks up the stored label for a reasonCode, so what gets saved on the
 * order/ride is the label AT THE TIME of the cancellation -- a later edit to
 * the admin's wording must not reach into old records.
 *
 * Falls back to whatever `reason` text the app sent: an unrecognised code
 * (stale app build, reason retired after the app cached its list, or "other")
 * must never fail the cancel itself.
 */
export async function resolveReasonText({ app, action, service, reasonCode, reason }) {
    if (!reasonCode || reasonCode === 'other') {
        return { reasonCode: reasonCode === 'other' ? 'other' : '', reason };
    }

    const stored = await CancelReason.findOne({ app, action, service, code: reasonCode }).select('label').lean();
    if (!stored) {
        // Unknown code: save the text, drop the code (section 7.1's rule).
        return { reasonCode: '', reason };
    }

    return { reasonCode, reason: reason || stored.label };
}

/**
 * Confirms jobId names a real ride/order, so a reject-reason row can't be
 * filed for a made-up id.
 *
 * Does not confirm this exact driver was offered THIS job -- dispatch's
 * notified-driver list is in-memory only (dispatchService.js's activeDispatches
 * Map), gone on a restart and not visible to this request's process the way
 * a DB read is. Recording a reason this driver was never offered is a bad
 * report row, not a security hole (it can't act on anyone else's job), so
 * this looser check was chosen over adding persisted offer-tracking to the
 * live dispatch path for a reporting feature.
 */
async function jobExists(service, jobId) {
    if (!mongoose.Types.ObjectId.isValid(jobId)) return false;
    if (service === 'food') {
        const { FoodOrder } = await import('../../../modules/food/orders/models/order.model.js');
        return Boolean(await FoodOrder.exists({ _id: jobId }));
    }
    const { Ride } = await import('../../../modules/taxi/user/models/Ride.js');
    return Boolean(await Ride.exists({ _id: jobId }));
}

export async function recordOfferRejection({ driverId, service, jobId, reasonCode, reason }) {
    if (!(await jobExists(service, jobId))) {
        throw new ApiError(404, 'No such ride or order');
    }

    const resolved = await resolveReasonText({ app: 'delivery', action: 'reject', service, reasonCode, reason });

    return OfferRejection.findOneAndUpdate(
        { driverId, service, jobId },
        { $set: { reasonCode: resolved.reasonCode, reason: resolved.reason } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
    );
}
