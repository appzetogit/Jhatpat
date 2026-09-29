export const ADMIN_LEVELS = {
  PLATFORM_SUPERADMIN: 'platform_superadmin',
  FOOD_SUPERADMIN: 'food_superadmin',
  TAXI_SUPERADMIN: 'taxi_superadmin',
  SUBADMIN: 'subadmin'
};

export const ADMIN_MODULES = {
  FOOD: 'food',
  TAXI: 'taxi'
};

// The module each per-service superadmin level owns. Adding a service means adding
// one row here rather than another hardcoded if-pair in adminHierarchy.service.js.
export const MODULE_SUPERADMIN_LEVELS = {
  [ADMIN_MODULES.FOOD]: ADMIN_LEVELS.FOOD_SUPERADMIN,
  [ADMIN_MODULES.TAXI]: ADMIN_LEVELS.TAXI_SUPERADMIN
};
