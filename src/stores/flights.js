import { defineStore } from "pinia";
import { airports } from "../data/referenceData";
import { apiRequest } from "../services/api";
import { API_ENDPOINTS } from "../services/endpoints";
import { entityId, normalizeAirline, normalizeFlight, unwrapPayload } from "../utils/normalizers";

function dateInputValue(daysFromToday = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

export const useFlightsStore = defineStore("flights", {
  state: () => ({
    flights: [],
    airlines: [],
    airports,
    initialized: false,
    loading: false,
    error: "",
    lastSearch: {
      from: "MNL",
      to: "NRT",
      departureDate: dateInputValue(1),
      passengers: 1,
      cabin: "economy",
    },
  }),
  getters: {
    getFlightById: (state) => (id) => state.flights.find((flight) => flight.id === String(id)),
    getAirlineById: (state) => (id) => state.airlines.find((airline) => airline.id === String(id)),
    airportByCode: (state) => (code) => state.airports.find((airport) => airport.code === code),
  },
  actions: {
    async initialize(force = false) {
      if (this.initialized && !force) return;
      this.loading = true;
      this.error = "";
      const results = await Promise.allSettled([this.fetchFlights(), this.fetchAirlines()]);
      const rejected = results.find((result) => result.status === "rejected");
      if (rejected) this.error = rejected.reason?.message || "Unable to load flight data.";
      this.initialized = true;
      this.loading = false;
    },

    mergePopulatedAirlines() {
      for (const flight of this.flights) {
        if (!flight.airline || !flight.airline.id) continue;
        if (!this.airlines.some((airline) => airline.id === flight.airline.id)) {
          this.airlines.push(flight.airline);
        }
      }
    },

    async fetchFlights() {
      const response = await apiRequest(API_ENDPOINTS.flights);
      const list = unwrapPayload(response, ["flights"]);
      this.flights = Array.isArray(list) ? list.map(normalizeFlight) : [];
      this.mergePopulatedAirlines();
      return this.flights;
    },

    async fetchAirlines() {
      const response = await apiRequest(API_ENDPOINTS.airlines);
      const list = unwrapPayload(response, ["airlines"]);
      this.airlines = Array.isArray(list) ? list.map(normalizeAirline) : [];
      this.mergePopulatedAirlines();
      return this.airlines;
    },

    async fetchFlightById(id) {
      const existing = this.getFlightById(id);
      if (existing) return existing;
      const response = await apiRequest(API_ENDPOINTS.flight(id));
      const data = unwrapPayload(response);
      const rawFlight = data?.flight ?? data;
      if (!entityId(rawFlight)) throw new Error("The flight endpoint did not return a flight record.");
      const flight = normalizeFlight(rawFlight);
      this.flights.push(flight);
      this.mergePopulatedAirlines();
      return flight;
    },

    setLastSearch(search) {
      this.lastSearch = { ...this.lastSearch, ...search };
    },

    searchFlights(criteria) {
      const from = criteria.from?.toUpperCase();
      const to = criteria.to?.toUpperCase();
      const date = criteria.departureDate;
      const passengers = Number(criteria.passengers || 1);
      const cabin = criteria.cabin || "economy";

      if (from === "ANY" && to === "ANY")
        return this.flights;

      return this.flights.filter((flight) => {
        const seats = cabin === "business" ? flight.busSeatsAvailable : flight.ecoSeatsAvailable;
        return (
          (!from || flight.departure === from) &&
          (!to || flight.destination === to) &&
          (!date || flight.departureDate?.slice(0, 10) === date) &&
          seats >= passengers &&
          flight.status !== "Cancelled"
        );
      });
    },

    async saveFlight(payload) {
      const isUpdate = Boolean(payload.id);
      const response = await apiRequest(
        isUpdate ? API_ENDPOINTS.flight(payload.id) : API_ENDPOINTS.flights,
        {
          method: isUpdate ? "PATCH" : "POST",
          body: {
            airline: payload.airlineId,
            flightNumber: payload.flightNumber,
            departure: payload.departure,
            destination: payload.destination,
            departureDate: payload.departureDate,
            arrivalDate: payload.arrivalDate,
            price: Number(payload.price),
            ecoSeatsAvailable: Number(payload.ecoSeatsAvailable),
            busSeatsAvailable: Number(payload.busSeatsAvailable),
            isDirect: Boolean(payload.isDirect),
            status: payload.status,
          },
        },
      );
      const data = unwrapPayload(response);
      const rawFlight = data?.flight ?? data;
      if (!entityId(rawFlight)) {
        await this.fetchFlights();
        return isUpdate ? this.getFlightById(payload.id) : null;
      }
      const saved = normalizeFlight(rawFlight);
      const index = this.flights.findIndex((flight) => flight.id === saved.id);
      if (index === -1) this.flights.push(saved);
      else this.flights.splice(index, 1, saved);
      this.mergePopulatedAirlines();
      return saved;
    },

    async deleteFlight(id) {
      await apiRequest(API_ENDPOINTS.flight(id), { method: "DELETE" });
      this.flights = this.flights.filter((flight) => flight.id !== id);
    },

    async saveAirline(payload) {
      const isUpdate = Boolean(payload.id);
      const response = await apiRequest(
        isUpdate ? API_ENDPOINTS.airline(payload.id) : API_ENDPOINTS.airlines,
        {
          method: isUpdate ? "PATCH" : "POST",
          body: {
            name: payload.name.trim(),
            code: payload.code.trim().toUpperCase(),
            rating: Number(payload.rating),
          },
        },
      );
      const data = unwrapPayload(response);
      const rawAirline = data?.airline ?? data;
      if (!entityId(rawAirline)) {
        await this.fetchAirlines();
        return isUpdate ? this.getAirlineById(payload.id) : null;
      }
      const saved = normalizeAirline(rawAirline);
      const index = this.airlines.findIndex((airline) => airline.id === saved.id);
      if (index === -1) this.airlines.push(saved);
      else this.airlines.splice(index, 1, saved);
      return saved;
    },

    async deleteAirline(id) {
      await apiRequest(API_ENDPOINTS.airline(id), { method: "DELETE" });
      this.airlines = this.airlines.filter((airline) => airline.id !== id);
    },
  },
});
