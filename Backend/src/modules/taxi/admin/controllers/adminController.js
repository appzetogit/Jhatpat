import { asyncHandler } from "../../../../utils/asyncHandler.js";
import * as adminService from "../services/adminService.js";
import * as websiteService from "../services/websiteService.js";
import ExcelJS from 'exceljs';
import { LandingPageSetting } from '../models/LandingPageSetting.js';
import { ApiError } from '../../../../utils/ApiError.js';
import { uploadDataUrlToCloudinary } from '../../../../utils/cloudinaryUpload.js';

const ok = (res, data, extra = {}) =>
  res.json({ success: true, data, ...extra });

const sendFile = async (res, filename, reportData, format) => {
  const { headers, rows } = reportData;

  if (format === 'csv') {
    const content = adminService.csvFromRows(headers, rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
    res.send(content);
  } else {
    // Generate real Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add headers
    worksheet.addRow(headers.map(h => String(h).toUpperCase()));

    // Add rows
    rows.forEach(row => {
      worksheet.addRow(headers.map(h => row[h]));
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }
};

export const getAdminStatus = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getAdminModuleInfo()),
);
export const loginAdmin = asyncHandler(async (req, res) =>
  ok(res, await adminService.loginAdmin(req.body)),
);
export const forgotPassword = asyncHandler(async (req, res) =>
  ok(res, await adminService.forgotPassword(req.body.email)),
);
export const verifyResetOtp = asyncHandler(async (req, res) =>
  ok(res, await adminService.verifyResetOtp(req.body)),
);
export const resetPassword = asyncHandler(async (req, res) =>
  ok(res, await adminService.resetPassword(req.body)),
);
export const getAdmins = asyncHandler(async (req, res) =>
  ok(res, { results: await adminService.listAdmins(req.auth?.admin) }),
);
export const getAdminPermissions = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listAdminPermissions() }),
);
export const createAdminAccount = asyncHandler(async (req, res) =>
  ok(res, await adminService.createAdminAccount(req.auth?.admin, req.body)),
);
export const updateAdminAccount = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateAdminAccount(req.auth?.admin, req.params.id, req.body)),
);
export const deleteAdminAccount = asyncHandler(async (req, res) => {
  await adminService.deleteAdminAccount(req.auth?.admin, req.params.id);
  ok(res, { deleted: true });
});

export const getUsers = asyncHandler(async (req, res) =>
  ok(res, await adminService.listUsers(req.query)),
);
export const bulkImportDrivers = asyncHandler(async (req, res) =>
  ok(res, await adminService.bulkImportDrivers(req.body)),
);
export const createUser = asyncHandler(async (req, res) =>
  ok(res, await adminService.createUser(req.body)),
);
export const updateUser = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateUser(req.params.id, req.body)),
);
export const getUser = asyncHandler(async (req, res) =>
  ok(res, await adminService.getUserById(req.params.id)),
);
export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  ok(res, { deleted: true });
});

export const getDeletedUsers = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDeletedUsers(req.query)),
);

export const restoreDeletedUser = asyncHandler(async (req, res) =>
  ok(res, await adminService.restoreDeletedUser(req.params.id)),
);

export const permanentlyDeleteDeletedUser = asyncHandler(async (req, res) => {
  await adminService.permanentlyDeleteDeletedUser(req.params.id);
  ok(res, { deleted: true });
});

export const getUserRequests = asyncHandler(async (req, res) =>
  ok(res, await adminService.listUserRequests(req.params.id)),
);

export const getUserWalletHistory = asyncHandler(async (req, res) =>
  ok(res, await adminService.listUserWalletHistory(req.params.id)),
);

export const adjustUserWallet = asyncHandler(async (req, res) =>
  ok(res, await adminService.adjustUserWallet(req.params.id, req.body)),
);

export const getDrivers = asyncHandler(async (req, res) => {
  ok(res, await adminService.listDrivers(req.query, req.auth?.admin));
});

export const getDriverRatings = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDriverRatings(req.query)),
);

export const getDriverRatingDetail = asyncHandler(async (req, res) =>
  ok(res, await adminService.getDriverRatingDetail(req.params.id)),
);

export const listDriverWalletHistory = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDriverWalletHistory(req.params.id)),
);

export const getNegativeBalanceDrivers = asyncHandler(async (req, res) =>
  ok(res, await adminService.listNegativeBalanceDrivers(req.query)),
);

export const getDriverWithdrawalSummaries = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDriverWithdrawalSummaries(req.query)),
);

export const getDriverWithdrawals = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.listDriverWithdrawals({
      driverId: req.params.id,
      page: req.query.page,
      limit: req.query.limit,
    }),
  ),
);

export const getDriverWithdrawalContextByRequestId = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.getDriverWithdrawalContextByRequestId({
      requestId: req.params.requestId,
      page: req.query.page,
      limit: req.query.limit,
    }),
  ),
);

export const approveDriverWithdrawalRequest = asyncHandler(async (req, res) =>
  ok(res, await adminService.approveDriverWithdrawalRequest(req.params.requestId, req.auth?.sub)),
);

export const rejectDriverWithdrawalRequest = asyncHandler(async (req, res) =>
  ok(res, await adminService.rejectDriverWithdrawalRequest(req.params.requestId)),
);


export const getDeletedDrivers = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDeletedDrivers(req.query)),
);

export const restoreDeletedDriver = asyncHandler(async (req, res) =>
  ok(res, await adminService.restoreDeletedDriver(req.params.id)),
);

export const permanentlyDeleteDeletedDriver = asyncHandler(async (req, res) => {
  await adminService.permanentlyDeleteDeletedDriver(req.params.id);
  ok(res, { deleted: true });
});

export const getDriverDeletionRequests = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDriverDeletionRequests(req.query)),
);

export const approveDriverDeletionRequest = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.approveDriverDeletionRequest(req.params.id, req.auth?.sub),
  ),
);

export const rejectDriverDeletionRequest = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.rejectDriverDeletionRequest(
      req.params.id,
      req.body,
      req.auth?.sub,
    ),
  ),
);

export const createDriver = asyncHandler(async (req, res) =>
  ok(res, await adminService.createDriver(req.body, req.auth?.admin)),
);
export const getDriver = asyncHandler(async (req, res) =>
  ok(res, await adminService.getDriverById(req.params.id, req.auth?.admin)),
);
export const getDriverProfile = asyncHandler(async (req, res) =>
  ok(res, await adminService.getDriverProfile(req.params.id)),
);
export const updateDriver = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateDriver(req.params.id, req.body, req.auth?.admin)),
);
export const updateDriverPassword = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.updateDriverPassword(req.params.id, req.body.password),
  ),
);
export const deleteDriver = asyncHandler(async (req, res) => {
  await adminService.deleteDriver(req.params.id);
  ok(res, { deleted: true });
});

export const adjustDriverWallet = asyncHandler(async (req, res) =>
  ok(res, await adminService.adjustDriverWallet(req.params.id, req.body)),
);



export const getReferralSettings = asyncHandler(async (req, res) =>
  ok(res, await adminService.getReferralSettings(req.params.type)),
);

export const updateReferralSettings = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateReferralSettings(req.params.type, req.body)),
);

export const getReferralDashboard = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getReferralDashboard()),
);

export const getServiceLocations = asyncHandler(async (req, res) =>
  ok(res, await adminService.listServiceLocations(req.auth?.admin)),
);
export const getCountries = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listCountries() }),
);
export const createServiceLocation = asyncHandler(async (req, res) =>
  ok(res, await adminService.createServiceLocation(req.body, req.auth?.admin)),
);
export const updateServiceLocation = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateServiceLocation(req.params.id, req.body, req.auth?.admin)),
);
export const deleteServiceLocation = asyncHandler(async (req, res) => {
  await adminService.deleteServiceLocation(req.params.id, req.auth?.admin);
  ok(res, { deleted: true });
});
export const getNearbyServiceLocations = asyncHandler(async (req, res) =>
  ok(res, {
    results: await adminService.listNearbyServiceLocations(req.query),
  }),
);
export const getRideModules = asyncHandler(async (_req, res) =>
  ok(res, await adminService.listRideModules()),
);
export const getOngoingRides = asyncHandler(async (req, res) =>
  ok(res, await adminService.listOngoingRides(req.query)),
);
export const getRideRequests = asyncHandler(async (req, res) =>
  ok(res, await adminService.listRideRequests(req.query)),
);
export const getDeliveries = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDeliveries(req.query)),
);
export const deleteTripRequest = asyncHandler(async (req, res) =>
  ok(res, await adminService.removeRideFromTrips(req.params.id, req.auth?.sub)),
);

export const deleteOngoingRide = asyncHandler(async (req, res) =>
  ok(res, await adminService.deleteOngoingRide(req.params.id)),
);
export const getVehicleTypes = asyncHandler(async (req, res) =>
  ok(res, await adminService.listVehicleTypes(req.query)),
);
export const getVehicleTypeCatalog = asyncHandler(async (_req, res) =>
  ok(res, await adminService.listVehicleCatalog()),
);
/**
 * `?appModuleId=` narrows the catalogue to the module the customer is
 * booking from. Omitted, it returns everything, which is what every
 * existing caller gets.
 */
/**
 * The zone a catalogue request is for.
 *
 * An explicit zoneId wins. Otherwise the pickup coordinates are matched
 * against the zone polygons -- the same lookup dispatch uses, so the vehicles
 * a rider is shown are the ones that zone can actually price and dispatch.
 *
 * Returns null when there is no location to go on, or the point falls outside
 * every zone. The caller then filters nothing.
 */
const resolveCatalogZoneId = async (query = {}) => {
  const explicit = String(query.zoneId || '').trim();
  if (explicit) return explicit;

  const lat = Number(query.lat);
  const lng = Number(query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  try {
    const { findZoneByPickup } = await import('../../services/matchingService.js');
    const zone = await findZoneByPickup([lng, lat]);
    return zone?._id ? String(zone._id) : null;
  } catch {
    // A zone lookup that fails must not fail the catalogue: the rider gets
    // the full list rather than an error.
    return null;
  }
};

/**
 * GET /taxi/users/popular-places?lat=&lng=
 *
 * Public, like the vehicle catalogue beside it.
 */
export const getPopularPlaces = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.listPopularPlacesNear({
      lat: req.query?.lat,
      lng: req.query?.lng,
    }),
  ),
);

export const getPublicVehicleTypeCatalog = asyncHandler(async (req, res) => {
  const zoneId = await resolveCatalogZoneId(req.query || {});
  return ok(
    res,
    await adminService.listPublicVehicleCatalog(req.query?.appModuleId || null, { zoneId }),
  );
});
/**
 * Public ride/package tariffs for the rider app.
 *
 * Passing null as currentAdmin is deliberate: listSetPrices only applies the
 * set_prices.view permission check and zone/service-location scoping when an
 * admin is supplied. This mirrors the pre-merge public route exactly, which
 * called the same service the same way.
 */
export const getPublicSetPrices = asyncHandler(async (req, res) => {
  const data = await adminService.listSetPrices(req.query || {}, null);
  // Public list only: vehicles with no row of their own are listed with the row
  // they borrow from a namesake, so an app looking prices up by vehicle finds
  // the one the booking charges from. The admin list is untouched.
  const { addBorrowedRidePriceRows } = await import('../../services/rideService.js');
  const results = await addBorrowedRidePriceRows(data.results);
  res.json({ success: true, ...data, results });
});

export const getVehiclePreferenceOptions = asyncHandler(async (_req, res) =>
  ok(res, await adminService.listVehiclePreferences()),
);
export const createVehicleType = asyncHandler(async (req, res) =>
  ok(res, await adminService.createVehicleType(req.body)),
);
export const updateVehicleType = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateVehicleType(req.params.id, req.body)),
);
export const deleteVehicleType = asyncHandler(async (req, res) => {
  await adminService.deleteVehicleType(req.params.id);
  ok(res, { deleted: true });
});




export const getDashboardData = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getDashboardData()),
);
export const getOverallEarnings = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getOverallEarnings()),
);
export const getAdminEarnings = asyncHandler(async (req, res) =>
  ok(res, await adminService.getAdminEarnings(req.query)),
);
export const getTodayEarnings = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getTodayEarnings()),
);
export const getCancelChart = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getCancelChart()),
);
export const getWithdrawals = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listWithdrawals() }),
);

export const getZones = asyncHandler(async (req, res) =>
  ok(res, { results: await adminService.listZones(req.auth?.admin) }),
);
export const createZone = asyncHandler(async (req, res) =>
  ok(res, await adminService.createZone(req.body, req.auth?.admin)),
);
export const updateZone = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateZone(req.params.id, req.body, req.auth?.admin)),
);
export const deleteZone = asyncHandler(async (req, res) => {
  await adminService.deleteZone(req.params.id, req.auth?.admin);
  ok(res, { deleted: true });
});
export const toggleZoneStatus = asyncHandler(async (req, res) =>
  ok(res, await adminService.toggleZoneStatus(req.params.id, req.auth?.admin)),
);

export const getSetPrices = asyncHandler(async (req, res) => {
  const data = await adminService.listSetPrices(req.query || {}, req.auth?.admin);
  res.json({ success: true, ...data });
});
export const createSetPrice = asyncHandler(async (req, res) =>
  ok(res, await adminService.createSetPrice(req.body, req.auth?.admin)),
);
export const updateSetPrice = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateSetPrice(req.params.id, req.body, req.auth?.admin)),
);
export const deleteSetPrice = asyncHandler(async (req, res) => {
  await adminService.deleteSetPrice(req.params.id, req.auth?.admin);
  ok(res, { deleted: true });
});
export const getSurgeSlots = asyncHandler(async (req, res) =>
  ok(res, { results: await adminService.listSurgeSlots(req.auth?.admin) }),
);
export const createSurgeSlot = asyncHandler(async (req, res) =>
  ok(res, await adminService.createSurgeSlot(req.body, req.auth?.admin)),
);
export const updateSurgeSlot = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateSurgeSlot(req.params.id, req.body, req.auth?.admin)),
);
export const deleteSurgeSlot = asyncHandler(async (req, res) => {
  await adminService.deleteSurgeSlot(req.params.id, req.auth?.admin);
  ok(res, { deleted: true });
});

export const getAirports = asyncHandler(async (req, res) =>
  ok(res, { airports: await adminService.listAirports(req.auth?.admin) }),
);
export const createAirport = asyncHandler(async (req, res) =>
  ok(res, await adminService.createAirport(req.body, req.auth?.admin)),
);
export const updateAirport = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateAirport(req.params.id, req.body, req.auth?.admin)),
);
export const deleteAirport = asyncHandler(async (req, res) => {
  await adminService.deleteAirport(req.params.id, req.auth?.admin);
  ok(res, { deleted: true });
});




export const getGoodsTypes = asyncHandler(async (_req, res) =>
  res.json(await adminService.listGoodsTypes()),
);
export const createGoodsType = asyncHandler(async (req, res) =>
  ok(res, await adminService.createGoodsType(req.body)),
);
export const updateGoodsType = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateGoodsType(req.params.id, req.body)),
);
export const deleteGoodsType = asyncHandler(async (req, res) => {
  await adminService.deleteGoodsType(req.params.id);
  ok(res, { deleted: true });
});


export const getDriverNeededDocuments = asyncHandler(async (req, res) =>
  ok(res, {
    results: await adminService.listDriverNeededDocuments({
      templateType: req.query?.template_type || 'document',
      includeFields: String(req.query?.template_type || 'document').trim().toLowerCase() !== 'vehicle_field',
    }),
  }),
);
export const getDriverNeededDocument = asyncHandler(async (req, res) =>
  ok(res, await adminService.getDriverNeededDocumentById(req.params.id)),
);
export const createDriverNeededDocument = asyncHandler(async (req, res) =>
  ok(res, await adminService.createDriverNeededDocument(req.body)),
);
export const updateDriverNeededDocument = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateDriverNeededDocument(req.params.id, req.body)),
);
export const deleteDriverNeededDocument = asyncHandler(async (req, res) => {
  await adminService.deleteDriverNeededDocument(req.params.id);
  ok(res, { deleted: true });
});
export const getReferralTranslations = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listReferralTranslations() }),
);
export const updateReferralTranslation = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateReferralTranslation(req.params.languageCode, req.body)),
);

export const getLanguages = asyncHandler(async (_req, res) => {
  const items = await adminService.listLanguages();
  res.json({ success: true, paginator: { data: items }, results: items });
});
export const updateLanguageStatus = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateLanguageStatus(req.params.id, req.body)),
);
export const deleteLanguage = asyncHandler(async (req, res) => {
  await adminService.deleteLanguage(req.params.id);
  ok(res, { deleted: true });
});

export const getPreferences = asyncHandler(async (_req, res) => {
  const items = await adminService.listPreferences();
  res.json({ success: true, paginator: { data: items }, results: items });
});
export const createPreference = asyncHandler(async (req, res) =>
  ok(res, await adminService.createPreference(req.body)),
);
export const updatePreferenceStatus = asyncHandler(async (req, res) =>
  ok(res, await adminService.updatePreferenceStatus(req.params.id, req.body)),
);
export const deletePreference = asyncHandler(async (req, res) => {
  await adminService.deletePreference(req.params.id);
  ok(res, { deleted: true });
});

export const getRoles = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listRoles() }),
);
export const createRole = asyncHandler(async (req, res) =>
  ok(res, await adminService.createRole(req.body)),
);
export const deleteRole = asyncHandler(async (req, res) => {
  await adminService.deleteRole(req.params.id);
  ok(res, { deleted: true });
});

export const getAppModules = asyncHandler(async (req, res) =>
  ok(res, await adminService.listAppModules(req.query)),
);
export const createAppModule = asyncHandler(async (req, res) =>
  ok(res, await adminService.createAppModule(req.body)),
);
export const updateAppModule = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateAppModule(req.params.id, req.body)),
);
export const deleteAppModule = asyncHandler(async (req, res) => {
  await adminService.deleteAppModule(req.params.id);
  ok(res, { deleted: true });
});

export const getNotificationChannels = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listNotificationChannels() }),
);
export const toggleChannelPush = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.updateNotificationChannelField(
      req.params.id,
      "push_notification",
      req.body.push_notification,
    ),
  ),
);
export const toggleChannelMail = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.updateNotificationChannelField(
      req.params.id,
      "mail",
      req.body.mail,
    ),
  ),
);

export const getPaymentGateways = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listPaymentGateways() }),
);
export const getPaymentMethods = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listPaymentMethods() }),
);
export const createPaymentMethod = asyncHandler(async (req, res) =>
  ok(res, await adminService.createPaymentMethod(req.body)),
);
export const updatePaymentMethod = asyncHandler(async (req, res) =>
  ok(res, await adminService.updatePaymentMethod(req.params.id, req.body)),
);
export const deletePaymentMethod = asyncHandler(async (req, res) => {
  await adminService.deletePaymentMethod(req.params.id);
  ok(res, { deleted: true });
});
export const getPaymentSettings = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getPaymentSettings()),
);
export const updatePaymentSettings = asyncHandler(async (req, res) =>
  ok(res, await adminService.updatePaymentSettings(req.body)),
);

export const getSmsSettings = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getSMSSettings()),
);
export const updateSmsSettings = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateSMSSettings(req.body)),
);

export const getFirebaseSettings = asyncHandler(async (_req, res) =>
  ok(res, { settings: await adminService.getFirebaseSettings() }),
);
export const updateFirebaseSettings = asyncHandler(async (req, res) =>
  ok(res, { settings: await adminService.updateFirebaseSettings(req.body) }),
);

export const getMapSettings = asyncHandler(async (_req, res) =>
  ok(res, { settings: await adminService.getMapSettings() }),
);
export const updateMapSettings = asyncHandler(async (req, res) =>
  ok(res, { settings: await adminService.updateMapSettings(req.body) }),
);

export const getMailSettings = asyncHandler(async (_req, res) =>
  ok(res, { settings: await adminService.getMailSettings() }),
);
export const updateMailSettings = asyncHandler(async (req, res) =>
  ok(res, { settings: await adminService.updateMailSettings(req.body) }),
);

export const getUserOnboarding = asyncHandler(async (_req, res) =>
  res.json({
    success: true,
    results: await adminService.listOnboardingScreens("user"),
  }),
);
export const getDriverOnboarding = asyncHandler(async (_req, res) =>
  res.json({
    success: true,
    results: await adminService.listOnboardingScreens("driver"),
  }),
);
export const createOnboardingScreen = asyncHandler(async (req, res) =>
  ok(res, await adminService.createOnboardingScreen(req.body)),
);
export const updateOnboardingScreen = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateOnboardingScreen(req.params.id, req.body)),
);
export const deleteOnboardingScreen = asyncHandler(async (req, res) =>
  ok(res, await adminService.deleteOnboardingScreen(req.params.id)),
);

export const downloadUserReport = asyncHandler(async (req, res) => {
  const format = req.query.file_format || 'csv';
  const data = await adminService.buildUserReport(req.query);
  await sendFile(res, "user-report", data, format);
});

export const downloadDriverReport = asyncHandler(async (req, res) => {
  const format = req.query.file_format || 'csv';
  const data = await adminService.buildDriverReport(req.query);
  await sendFile(res, "driver-report", data, format);
});

export const downloadDriverDutyReport = asyncHandler(async (req, res) => {
  const format = req.query.file_format || 'csv';
  const data = await adminService.buildDriverDutyReport(req.query);
  await sendFile(res, "driver-duty-report", data, format);
});

export const downloadFinanceReport = asyncHandler(async (req, res) => {
  const format = req.query.file_format || 'csv';
  const data = await adminService.buildFinanceReport(req.query);
  await sendFile(res, "finance-report", data, format);
});

export const getGeneralSettingsCategory = asyncHandler(async (req, res) =>
  ok(res, await adminService.getGeneralSettings(req.params.category)),
);
export const updateGeneralSettingsCategory = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.updateGeneralSettings(req.params.category, req.body),
  ),
);
export const getTransportTypes = asyncHandler(async (_req, res) => {
  ok(res, await adminService.listTransportTypes());
});

/*
 * The About / Careers / Newsroom / legal text. The public website home page now
 * has its own editor (see websiteService), so this only manages `pages`, which
 * the apps and the /taxi/* static pages still read.
 */
export const getLandingPageSettings = asyncHandler(async (req, res) => {
  const settings = await LandingPageSetting.findOneAndUpdate(
    { scope: 'default' },
    { $setOnInsert: { scope: 'default' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return ok(res, { pages: settings.pages || {} });
});

export const updateLandingPageSettings = asyncHandler(async (req, res) => {
  const { pages } = req.body;
  if (!pages || typeof pages !== 'object' || Array.isArray(pages)) {
    throw new ApiError(400, 'pages object is required');
  }
  const allowed = ['about_us', 'careers', 'newsroom', 'terms_conditions', 'privacy_policy', 'refund_policy', 'cancellation_policy'];
  const set = {};
  for (const key of allowed) {
    if (pages[key] !== undefined) set[`pages.${key}`] = String(pages[key]);
  }
  const settings = await LandingPageSetting.findOneAndUpdate(
    { scope: 'default' },
    { $set: set, $setOnInsert: { scope: 'default' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return ok(res, { pages: settings.pages || {} });
});

export const uploadImage = asyncHandler(async (req, res) => {
  const { image } = req.body;
  if (!image) throw new ApiError(400, 'Image data is required');

  const result = await uploadDataUrlToCloudinary({
    dataUrl: image,
    publicIdPrefix: 'admin-upload',
  });

  return res.status(200).json({ success: true, data: { url: result.secureUrl }, message: 'Image uploaded successfully' });
});

export const getWebsite = asyncHandler(async (_req, res) => ok(res, await websiteService.getWebsiteForAdmin()));
export const saveWebsite = asyncHandler(async (req, res) =>
  ok(res, await websiteService.saveWebsite(req.body, req.auth?.sub)),
);
export const resetWebsite = asyncHandler(async (req, res) =>
  ok(res, await websiteService.resetWebsite(req.auth?.sub)),
);
