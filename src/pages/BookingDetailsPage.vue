<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import EmptyState from "../components/EmptyState.vue";
import { useAuthStore } from "../stores/auth";
import { useBookingsStore } from "../stores/bookings";
import { useFlightsStore } from "../stores/flights";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

const route = useRoute();
const authStore = useAuthStore();
const bookingsStore = useBookingsStore();
const flightsStore = useFlightsStore();
const loading = ref(true);
const error = ref("");

const booking = computed(() => bookingsStore.getBookingById(route.params.bookingId));
const authorizedBooking = computed(() => {
  if (!booking.value) return null;
  if (!booking.value.userId || booking.value.userId === authStore.currentUser.id || authStore.isAdmin) return booking.value;
  return null;
});
const flight = computed(() => authorizedBooking.value?.flight || (authorizedBooking.value ? flightsStore.getFlightById(authorizedBooking.value.flightId) : null));
const airline = computed(() => flight.value?.airline || (flight.value ? flightsStore.getAirlineById(flight.value.airlineId) : null));

onMounted(async () => {
  try {
    const loadedBooking = await bookingsStore.fetchBookingById(route.params.bookingId);
    if (!loadedBooking.flight && loadedBooking.flightId) {
      await flightsStore.fetchFlightById(loadedBooking.flightId);
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page-shell page-shell--muted">
    <div v-if="loading" class="container-xl section-block">
      <p>Loading booking details from the backend…</p>
    </div>

    <div v-else-if="authorizedBooking && flight" class="container-lg confirmation-page">
      <div v-if="route.query.new" class="confirmation-banner">
        <span><i class="bi bi-check-lg"></i></span>
        <div><h1>Booking confirmed</h1><p>Your reservation was accepted by the backend and is ready to review.</p></div>
      </div>

      <div class="ticket-card">
        <div class="ticket-head">
          <div>
            <span class="eyebrow">Booking reference</span>
            <strong>{{ authorizedBooking.reference }}</strong>
          </div>
          <span class="status-badge" :class="`status-${authorizedBooking.status.toLowerCase()}`">{{ authorizedBooking.status }}</span>
        </div>

        <div class="ticket-flight">
          <div class="ticket-airline">
            <span class="airline-logo">{{ airline?.code || "FL" }}</span>
            <div><strong>{{ airline?.name || "Airline" }}</strong><span>{{ flight.flightNumber }} · {{ authorizedBooking.cabin }}</span></div>
          </div>
          <div class="ticket-route">
            <div><strong>{{ flight.departure }}</strong><span>{{ formatTime(flight.departureDate) }}</span><small>{{ formatDate(flight.departureDate) }}</small></div>
            <div class="ticket-line"><i class="bi bi-airplane"></i></div>
            <div class="text-end"><strong>{{ flight.destination }}</strong><span>{{ formatTime(flight.arrivalDate) }}</span><small>{{ formatDate(flight.arrivalDate) }}</small></div>
          </div>
        </div>

        <div class="ticket-grid">
          <div><span>Travelers</span><strong>{{ authorizedBooking.passengers }}</strong></div>
          <div><span>Payment</span><strong>{{ authorizedBooking.paymentMethod === 'pay-later' ? 'Pay later' : 'Card' }}</strong></div>
          <div><span>Booked on</span><strong>{{ formatDate(authorizedBooking.bookingDate) }}</strong></div>
          <div><span>Total fare</span><strong>{{ formatCurrency(authorizedBooking.totalPrice) }}</strong></div>
        </div>
      </div>

      <section class="traveler-list-panel">
        <div class="panel-heading"><h2>Traveler details</h2><span>{{ authorizedBooking.passengerDetails.length }} total</span></div>
        <div class="traveler-list">
          <div v-for="(passenger, index) in authorizedBooking.passengerDetails" :key="index">
            <span>{{ index + 1 }}</span>
            <div><strong>{{ passenger.firstName }} {{ passenger.lastName }}</strong><small>{{ passenger.nationality }} · Born {{ formatDate(passenger.birthDate) }}</small></div>
          </div>
        </div>
      </section>

      <div class="confirmation-actions">
        <RouterLink class="btn btn-dark" :to="{ name: 'my-bookings' }">All bookings</RouterLink>
        <RouterLink class="btn btn-outline-dark" :to="{ name: 'home' }">Back home</RouterLink>
      </div>
    </div>

    <div v-else class="container-xl section-block">
      <EmptyState icon="bi-shield-x" title="Booking unavailable" :description="error || 'This booking does not exist or you do not have access to it.'">
        <RouterLink class="btn btn-dark" :to="{ name: 'my-bookings' }">My bookings</RouterLink>
      </EmptyState>
    </div>
  </div>
</template>
