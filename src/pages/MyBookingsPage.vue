<script setup>
import { computed, onMounted, ref } from "vue";
import EmptyState from "../components/EmptyState.vue";
import { useAuthStore } from "../stores/auth";
import { useBookingsStore } from "../stores/bookings";
import { useFlightsStore } from "../stores/flights";
import { useUiStore } from "../stores/ui";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

const authStore = useAuthStore();
const bookingsStore = useBookingsStore();
const flightsStore = useFlightsStore();
const uiStore = useUiStore();
const error = ref("");

const activeTab = ref("upcoming");
const userBookings = computed(() => bookingsStore.bookingsForUser(authStore.currentUser.id));
const visibleBookings = computed(() => userBookings.value.filter((booking) => {
  if (activeTab.value === "cancelled") return booking.status === "Cancelled";
  if (activeTab.value === "all") return true;
  return booking.status !== "Cancelled";
}));

onMounted(async () => {
  const results = await Promise.allSettled([
    bookingsStore.fetchMyBookings(),
    flightsStore.initialize(),
  ]);
  const failed = results.find((result) => result.status === "rejected");
  if (failed) error.value = failed.reason?.message || "Unable to load your bookings.";
});

function flightFor(booking) {
  return booking.flight || flightsStore.getFlightById(booking.flightId);
}

async function cancel(id) {
  if (!window.confirm("Cancel this booking?")) return;
  error.value = "";
  try {
    await bookingsStore.cancelBooking(id);
    uiStore.notify("Booking cancelled.");
  } catch (err) {
    error.value = err.message;
    uiStore.notify(err.message, "error");
  }
}
</script>

<template>
  <div class="page-shell page-shell--muted">
    <section class="container-xl dashboard-header">
      <span class="eyebrow">Your trips</span>
      <h1>My bookings</h1>
      <p>Review references, payment status, passenger count, and upcoming flight details.</p>
    </section>

    <div class="container-xl bookings-content">
      <div v-if="error" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ error }}</div>

      <div class="tab-bar" role="tablist" aria-label="Booking filters">
        <button :class="{ active: activeTab === 'upcoming' }" type="button" @click="activeTab = 'upcoming'">Active</button>
        <button :class="{ active: activeTab === 'cancelled' }" type="button" @click="activeTab = 'cancelled'">Cancelled</button>
        <button :class="{ active: activeTab === 'all' }" type="button" @click="activeTab = 'all'">All</button>
      </div>

      <p v-if="bookingsStore.loading">Loading bookings from the backend…</p>

      <div v-else-if="visibleBookings.length" class="booking-list">
        <article v-for="booking in visibleBookings" :key="booking.id" class="booking-card">
          <template v-if="flightFor(booking)">
            <div class="booking-card-head">
              <div>
                <span class="booking-reference">{{ booking.reference }}</span>
                <span class="status-badge" :class="`status-${booking.status.toLowerCase()}`">{{ booking.status }}</span>
              </div>
              <span>Booked {{ formatDate(booking.bookingDate) }}</span>
            </div>
            <div class="booking-card-body">
              <div class="booking-route-compact">
                <div><strong>{{ flightFor(booking).departure }}</strong><span>{{ formatTime(flightFor(booking).departureDate) }}</span></div>
                <div><i class="bi bi-airplane"></i><span>{{ flightFor(booking).flightNumber }}</span></div>
                <div><strong>{{ flightFor(booking).destination }}</strong><span>{{ formatTime(flightFor(booking).arrivalDate) }}</span></div>
              </div>
              <div class="booking-card-meta">
                <div><span>Date</span><strong>{{ formatDate(flightFor(booking).departureDate) }}</strong></div>
                <div><span>Travelers</span><strong>{{ booking.passengers }}</strong></div>
                <div><span>Cabin</span><strong class="text-capitalize">{{ booking.cabin }}</strong></div>
                <div><span>Total</span><strong>{{ formatCurrency(booking.totalPrice) }}</strong></div>
              </div>
            </div>
            <div class="booking-card-actions">
              <RouterLink class="btn btn-outline-dark btn-sm" :to="{ name: 'booking-details', params: { bookingId: booking.id } }">View details</RouterLink>
              <button v-if="booking.status !== 'Cancelled'" class="btn btn-link-danger btn-sm" type="button" @click="cancel(booking.id)">Cancel booking</button>
            </div>
          </template>
        </article>
      </div>

      <EmptyState v-else icon="bi-ticket-perforated" title="No bookings here" description="Search for a flight and your confirmed reservations will appear here after the backend returns them.">
        <RouterLink class="btn btn-dark" :to="{ name: 'flights' }">Find a flight</RouterLink>
      </EmptyState>
    </div>
  </div>
</template>
