import { logger } from '../../utils/logger.js';

/**
 * BullMQ processor for automated maintenance tasks.
 * @param {import('bullmq').Job} job
 */
export const processMaintenanceJob = async (job) => {
    const data = job?.data || {};
    const type = data.type || 'unknown';

    logger.info(`[BullMQ:maintenance] type=${type} jobId=${job.id}`);

    if (type === 'SUBSCRIPTION_EXPIRY_CHECK') {
        logger.info('[BullMQ:maintenance] SUBSCRIPTION_EXPIRY_CHECK skipped because restaurant billing has been removed.');
    }

    if (type === 'FSSAI_EXPIRY_CHECK') {
        try {
            const { syncExpiredFssaiNotifications } = await import('../../modules/food/restaurant/services/fssaiExpiry.service.js');
            const results = await syncExpiredFssaiNotifications();
            logger.info(`[BullMQ:maintenance] FSSAI_EXPIRY_CHECK complete. Total Expired: ${results.totalExpired}, Notifications: ${results.createdCount}`);
        } catch (err) {
            logger.error(`[BullMQ:maintenance] FSSAI_EXPIRY_CHECK failed: ${err.message}`);
            throw err;
        }
    }

    if (type === 'STALE_SWEEP') {
        // Abandoned taxi rides stop blocking their driver and customer.
        try {
            const { sweepStaleRides } = await import('../../modules/taxi/services/staleRideSweep.js');
            await sweepStaleRides();
        } catch (err) {
            logger.error(`[BullMQ:maintenance] taxi stale ride sweep failed: ${err.message}`);
        }
    }

    return { processed: true, type, jobId: job.id };
};
