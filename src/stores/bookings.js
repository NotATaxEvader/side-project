import { defineStore } from "pinia";
import { apiRequest } from "../services/api";
import { API_ENDPOINTS } from "../services/endpoints";
import { entityId, normalizeBooking, unwrapPayload } from "../utils/normalizers";

export const useBookingsStore = defineStore("bookings", {
  state: () => ({
    bookings: [],
    initialized: false,
    loading: false,
    error: "",
  }),
  getters: {
    getBookingById: (state) => (id) => state.bookings.find((booking) => booking.id === String(id)),
    bookingsForUser: (state) => (userId) =>
      state.bookings
        .filter((booking) => !booking.userId || booking.userId === String(userId))
        .sort((a, b) => new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0)),
  },
  actions: {
    async initialize() {
      if (this.initialized) return this.bookings;
      return this.fetchMyBookings();
    },

    async fetchMyBookings() {
      this.loading = true;
      this.error = "";
      try {
        const response = await apiRequest(API_ENDPOINTS.myBookings);
        const list = unwrapPayload(response, ["bookings"]);
        this.bookings = Array.isArray(list) ? list.map(normalizeBooking) : [];
        this.initialized = true;
        return this.bookings;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllBookings() {
      this.loading = true;
      this.error = "";
      try {
        const response = await apiRequest(API_ENDPOINTS.bookings);
        const list = unwrapPayload(response, ["bookings"]);
        this.bookings = Array.isArray(list) ? list.map(normalizeBooking) : [];
        this.initialized = true;
        return this.bookings;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBookingById(id) {
      const response = await apiRequest(API_ENDPOINTS.booking(id));
      const data = unwrapPayload(response);
      const rawBooking = data?.booking ?? data;
      if (!entityId(rawBooking)) throw new Error("The booking endpoint did not return a booking record.");
      const booking = normalizeBooking(rawBooking);
      const index = this.bookings.findIndex((item) => item.id === booking.id);
      if (index === -1) this.bookings.push(booking);
      else this.bookings.splice(index, 1, booking);
      return booking;
    },

    async createBooking(payload) {
      const response = await apiRequest(API_ENDPOINTS.bookings, {
        method: "POST",
        body: {
          flightId: payload.flightId,
          passengers: Number(payload.passengers),
          passengerDetails: payload.passengerDetails,
          cabin: payload.cabin,
          paymentMethod: payload.paymentMethod,
          contactEmail: payload.contactEmail,
          contactNumber: payload.contactNumber,
        },
      });
      const data = unwrapPayload(response);
      const rawBooking = data?.booking ?? data;
      if (!entityId(rawBooking)) {
        throw new Error("The backend must return the created booking or its booking ID.");
      }
      const booking = normalizeBooking(rawBooking);
      this.bookings.push(booking);
      return booking;
    },

    async cancelBooking(id) {
      const response = await apiRequest(API_ENDPOINTS.cancelBooking(id), { method: "PATCH" });
      const data = unwrapPayload(response);
      const rawBooking = data?.booking ?? data;
      const updated = entityId(rawBooking)
        ? normalizeBooking(rawBooking)
        : await this.fetchBookingById(id);
      const index = this.bookings.findIndex((booking) => booking.id === String(id));
      if (index !== -1) this.bookings.splice(index, 1, updated);
      return updated;
    },

    async markPaid(id) {
      const response = await apiRequest(API_ENDPOINTS.bookingStatus(id), {
        method: "PATCH",
        body: { status: "Paid" },
      });
      const data = unwrapPayload(response);
      const rawBooking = data?.booking ?? data;
      const updated = entityId(rawBooking)
        ? normalizeBooking(rawBooking)
        : await this.fetchBookingById(id);
      const index = this.bookings.findIndex((booking) => booking.id === String(id));
      if (index !== -1) this.bookings.splice(index, 1, updated);
      return updated;
    },

    clear() {
      this.bookings = [];
      this.initialized = false;
      this.error = "";
    },
  },
});
