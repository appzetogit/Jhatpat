import mongoose from 'mongoose';

/**
 * A driver's reason for rejecting an offer, recorded by its own call.
 *
 * The app rejects the offer first (the existing reject path, which must keep
 * working with no reason at all) and asks for a reason afterwards, so this
 * has nothing to attach to on the order/ride at reject time. jobId is the
 * ride/order id; service says which kind so the same id space collision
 * between modules is never a concern.
 *
 * One row per driver+job: a correction (driver picks a different reason, or
 * the app retries) updates it rather than adding a second row.
 */
const offerRejectionSchema = new mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TaxiDriver',
            required: true,
        },
        service: {
            type: String,
            enum: ['food', 'ride', 'parcel'],
            required: true,
        },
        jobId: {
            type: String,
            required: true,
            trim: true,
        },
        reasonCode: {
            type: String,
            default: '',
            trim: true,
            lowercase: true,
        },
        reason: {
            type: String,
            default: '',
            trim: true,
            maxlength: 200,
        },
    },
    { timestamps: true },
);

offerRejectionSchema.index({ driverId: 1, service: 1, jobId: 1 }, { unique: true });

export const OfferRejection =
    mongoose.models.OfferRejection || mongoose.model('OfferRejection', offerRejectionSchema);
