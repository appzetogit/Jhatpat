import { config } from '../../../../config/env.js';
import { logger } from '../../../../utils/logger.js';

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

/**
 * Driving route via the Routes API (the legacy Directions / Distance Matrix
 * APIs are not enabled on current keys and answer REQUEST_DENIED).
 * @returns {Promise<{polyline: string, distanceMeters: number|null, durationSeconds: number|null}|null>}
 */
export async function computeRoute(origin, destination, apiKey, { timeoutMs = 5000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(ROUTES_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration',
            },
            body: JSON.stringify({
                origin: { location: { latLng: { latitude: Number(origin.lat), longitude: Number(origin.lng) } } },
                destination: { location: { latLng: { latitude: Number(destination.lat), longitude: Number(destination.lng) } } },
                travelMode: 'DRIVE',
            }),
        });
        const data = await res.json();
        const route = data?.routes?.[0];
        if (!res.ok || !route) {
            logger.warn(`Routes API ${data?.error?.status || res.status}: ${data?.error?.message || 'no routes'}`);
            return null;
        }
        const seconds = parseInt(String(route.duration || '').replace('s', ''), 10);
        return {
            polyline: route.polyline?.encodedPolyline || '',
            distanceMeters: Number.isFinite(route.distanceMeters) ? route.distanceMeters : null,
            durationSeconds: Number.isFinite(seconds) ? seconds : null,
        };
    } catch (err) {
        logger.warn(`Routes API request failed: ${err.message}`);
        return null;
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Fetches an encoded polyline. Call ONLY ONCE per order assignment to save costs.
 * @returns {Promise<string>} - Encoded polyline points
 */
export async function fetchPolyline(origin, destination) {
    const apiKey = config.googleMapsApiKey;
    if (!apiKey) {
        logger.warn('Google Maps API key missing. Polyline fetch skipped.');
        return '';
    }
    const route = await computeRoute(origin, destination, apiKey);
    return route?.polyline || '';
}
