import { ApiError } from '../../../../utils/ApiError.js';
import { User } from '../../user/models/User.js';
import { verifyAccessToken } from '../../services/tokenService.js';

// Platform/unified admin tokens (issued by core/auth, see auth.service.js) carry
// no `sub` claim and an uppercase role ('ADMIN'), unlike taxi-native tokens
// (sub set, role lowercase). REST already normalizes this per-request in
// authMiddleware.js; sockets need the same normalization once at connect time,
// or admin identity.sub is undefined and identity.role can't match the
// lowercase room names chat/dispatch code joins/broadcasts to.
const ADMIN_ROLE_ALIASES = new Set(['admin', 'super-admin', 'super_admin', 'superadmin']);

const normalizeRole = (role = '') => {
  const value = String(role || '').toLowerCase();
  return ADMIN_ROLE_ALIASES.has(value) ? 'admin' : value;
};

export const getIdentityFromSocket = (socket) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    throw new ApiError(401, 'Socket token is required');
  }

  const payload = verifyAccessToken(token);
  const sub = payload.sub || payload.userId || payload.id || null;

  return { ...payload, sub, role: normalizeRole(payload.role) };
};

export const attachSocketAuth = (io) => {
  io.use(async (socket, next) => {
    try {
      socket.auth = getIdentityFromSocket(socket);

      if (String(socket.auth.role || '').toLowerCase() === 'user') {
        const user = await User.findById(socket.auth.sub || socket.auth.id || socket.auth._id || socket.auth.userId).select('active isActive deletedAt').lean();

        if (!user || user.deletedAt || user.isActive === false || user.active === false) {
          throw new ApiError(401, 'User account is not active');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  });
};
