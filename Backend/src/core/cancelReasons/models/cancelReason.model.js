import mongoose from 'mongoose';

/**
 * Admin-managed cancel/reject reasons, shown as the reason sheet in the User
 * and Delivery apps. Both apps ship a hardcoded list today; this lets an admin
 * edit, reorder and retire reasons without an app release.
 *
 * `code` is the stable identity a saved cancellation/rejection points back to
 * (CancelReasonUsage... well, inline on the order/ride instead -- see
 * Ride.cancellation_reason_code, FoodOrder.cancellationReasonCode). It must
 * never change once a reason has been used, or old reports silently relabel.
 * Retire a reason with isActive: false; never delete one that's been used.
 *
 * "Other" is not a row here -- both apps add it client-side and send
 * code: "other" with their own typed text.
 */
const cancelReasonSchema = new mongoose.Schema(
    {
        app: {
            type: String,
            enum: ['user', 'delivery'],
            required: true,
        },
        action: {
            type: String,
            enum: ['cancel', 'reject'],
            required: true,
        },
        service: {
            type: String,
            enum: ['food', 'ride', 'parcel', 'service', 'scheduled_ride'],
            required: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        // User app supports Hindi; delivery app does not ask for it today.
        labelHi: {
            type: String,
            default: '',
            trim: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

cancelReasonSchema.index({ app: 1, action: 1, service: 1, code: 1 }, { unique: true });
cancelReasonSchema.index({ app: 1, action: 1, service: 1, isActive: 1, sortOrder: 1 });

export const CancelReason =
    mongoose.models.CancelReason || mongoose.model('CancelReason', cancelReasonSchema);
