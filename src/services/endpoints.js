// Keep backend route changes in this file. If your backend team uses different
// endpoint names, update them here without touching the Vue pages or stores.
export const API_ENDPOINTS = {
  login: "/users/login",
  register: "/users/register",
  profile: "/users/details",
  users: "/users",
  userRole: (userId) => `/users/${userId}/role`,

  flights: "/flights",
  flight: (flightId) => `/flights/${flightId}`,

  airlines: "/airlines",
  airline: (airlineId) => `/airlines/${airlineId}`,

  bookings: "/bookings",
  myBookings: "/bookings/my-bookings",
  booking: (bookingId) => `/bookings/${bookingId}`,
  cancelBooking: (bookingId) => `/bookings/${bookingId}/cancel`,
  bookingStatus: (bookingId) => `/bookings/${bookingId}/status`,
};
