import { logger } from '../../../../utils/logger.js';
import { Driver } from '../models/Driver.js';

/**
 * Takes a driver offline once isOnline and locationUpdatedAt have drifted too
 * far apart to trust.
 *
 * A driver whose app crashed, lost signal, or was force-quit never fires a
 * clean socket 'disconnect' -- isOnline stays true forever with a last-known
 * position from hours or days ago. Dispatch (matchingService.js) and the
 * booking map now both filter on locationUpdatedAt directly, so a stale
 * driver already stops receiving rides or showing on the map; this sweeper
 * is the cleanup that actually flips isOnline back to false, so the admin
 * panel and driver counts stop lying too.
 *
 * Not tied to BACKGROUND_JOBS_ENABLED: a driver left truly online with a
 * dead session is a correctness problem (see matchingService's own
 * staleness filter), not a convenience feature to skip on a read-mostly
 * instance. A driver mid-ride is never touched, regardless of how old their
 * last ping is -- losing signal in a tunnel should not drop them off a trip
 * they are still on.
 */
const STALE_MS = Number(process.env.DRIVER_OFFLINE_STALE_MS) || 10 * 60 * 1000;
const SWEEP_MS = 60 * 1000;

export async function sweepStaleDrivers() {
  const result = await Driver.updateMany(
    {
      isOnline: true,
      isOnRide: false,
      locationUpdatedAt: { $lt: new Date(Date.now() - STALE_MS) },
    },
    { $set: { isOnline: false, socketId: null } },
  );
  return result.modifiedCount || 0;
}

let sweeper = null;
export function startStaleDriverSweeper() {
  if (sweeper) return sweeper;
  sweeper = setInterval(() => {
    sweepStaleDrivers()
      .then((count) => { if (count) logger.info(`staleDriverSweeper: took ${count} stale driver(s) offline`); })
      .catch((err) => logger.warn(`staleDriverSweeper: sweep failed: ${err.message}`));
  }, SWEEP_MS);
  sweeper.unref?.();
  return sweeper;
}
export function stopStaleDriverSweeper() {
  if (sweeper) clearInterval(sweeper);
  sweeper = null;
}
