import { logger } from '../../utils/logger.js';

/**
 * Every id a single customer is known by, across the verticals.
 *
 * The activity feed is keyed on the userId that each vertical stamped on its own
 * document. Today food and taxi share one collection (`users`), so one id covers
 * both.
 */

const toTenDigits = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : null;
};

/**
 * @param {string} masterUserId  `users._id` from the caller's token
 * @returns {Promise<{ids: string[], phone: string|null, resolved: string[]}>}
 */
export const resolveCustomerIdentities = async (masterUserId) => {
    const ids = [masterUserId];
    const resolved = ['food/taxi'];
    let phone = null;

    try {
        const { FoodUser } = await import('../users/user.model.js');
        const master = await FoodUser.findById(masterUserId).select('phone').lean();
        phone = toTenDigits(master?.phone);
    } catch (err) {
        logger.warn(`[Activity] could not read the caller's phone: ${err.message}`);
    }

    return { ids, phone, resolved };
};
