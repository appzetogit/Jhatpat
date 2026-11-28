export const createDefaultBusinessSettings = () => ({
  scope: 'default',
  general: {
    app_name: 'Jhatpat',
    contact_booking_number: '9999999999',
    logo: '',
    favicon: '',
  },
  customization: {
    admin_theme_color: '#405189',
    landing_theme_color: '#0ab39c',
    sidebar_text_color: '#ffffff',
    currency_symbol: '₹',
    enable_driver_leaderboard_feature: '1',

    // Sign-in Toggles
  },
  transport_ride: {
    trip_dispatch_type: '1',
    maximum_time_for_find_drivers_for_regular_ride: '300',
    trip_accept_reject_duration_for_driver: '10',
    driver_search_radius: '5',
    minimum_time_for_starting_trip_drivers_for_schedule_ride: '15',
    can_round_the_bill_values: '1',
  },
  bid_ride: {
    bidding_low_percentage: '10',
    bidding_high_percentage: '20',
    bidding_amount_increase_or_decrease: '10',
    user_bidding_low_percentage: '10',
    user_bidding_high_percentage: '20',
    user_bidding_amount_increase_or_decrease: '10',
    user_fare_increase_wait_minutes: '2',
  },
});
