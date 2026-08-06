<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BookingSummary from "../components/BookingSummary.vue";
import EmptyState from "../components/EmptyState.vue";
import { useAuthStore } from "../stores/auth";
import { useBookingsStore } from "../stores/bookings";
import { useFlightsStore } from "../stores/flights";
import { useUiStore } from "../stores/ui";
import { formatCurrency } from "../utils/formatters";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const bookingsStore = useBookingsStore();
const flightsStore = useFlightsStore();
const uiStore = useUiStore();

const loadingFlight = ref(true);
const flight = computed(() => flightsStore.getFlightById(route.params.flightId));
const passengers = Math.min(8, Math.max(1, Number(route.query.passengers || 1)));
const cabin = route.query.cabin === "business" ? "business" : "economy";
const fareMultiplier = cabin === "business" ? 1.85 : 1;
const total = computed(() => Math.round((flight.value?.price || 0) * fareMultiplier * passengers));
const submitting = ref(false);
const error = ref("");
const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  contactEmail: authStore.currentUser?.email || "",
  contactNumber: authStore.currentUser?.contactNumber || "",
  paymentMethod: "card",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  accepted: false,
  passengerDetails: Array.from({ length: passengers }, (_, index) => ({
    firstName: index === 0 ? authStore.currentUser?.firstName || "" : "",
    lastName: index === 0 ? authStore.currentUser?.lastName || "" : "",
    birthDate: "",
    nationality: "Filipino",
  })),
});

onMounted(async () => {
  try {
    await flightsStore.fetchFlightById(route.params.flightId);
  } catch (err) {
    error.value = err.message;
  } finally {
    loadingFlight.value = false;
  }
});

async function submitBooking() {
  error.value = "";
  if (!flight.value) return;
  if (form.paymentMethod === "card" && form.cardNumber.replace(/\s/g, "").length < 12) {
    error.value = "Enter a valid card number for the simulated payment step.";
    return;
  }
  submitting.value = true;
  try {
    const booking = await bookingsStore.createBooking({
      flightId: flight.value.id,
      passengers,
      passengerDetails: form.passengerDetails,
      cabin,
      paymentMethod: form.paymentMethod,
      contactEmail: form.contactEmail,
      contactNumber: form.contactNumber,
    });
    if (!booking.id) throw new Error("The backend created the booking but did not return its ID.");
    uiStore.notify("Booking confirmed successfully.");
    await router.push({ name: "booking-details", params: { bookingId: booking.id }, query: { new: "1" } });
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="page-shell page-shell--muted">
    <div v-if="loadingFlight" class="container-xl section-block">
      <p>Loading flight details from the backend…</p>
    </div>

    <div v-else-if="flight" class="container-xl booking-page">
      <div class="booking-header">
        <RouterLink class="back-link" :to="{ name: 'flights', query: { from: flight.departure, to: flight.destination, date: flight.departureDate.slice(0, 10), passengers, cabin } }">
          <i class="bi bi-arrow-left"></i> Back to results
        </RouterLink>
        <span class="eyebrow">Checkout</span>
        <h1>Complete your booking</h1>
        <p>Review the selected flight and enter traveler details. Payment processing remains simulated until a payment service is connected.</p>
      </div>

      <div class="booking-layout">
        <form class="booking-form" @submit.prevent="submitBooking">
          <div v-if="error" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ error }}</div>

          <section class="form-section">
            <div class="form-section-heading">
              <span>1</span>
              <div><h2>Contact details</h2><p>We’ll use these details for the booking record.</p></div>
            </div>
            <div class="form-grid form-grid--two">
              <label class="form-field"><span>Email address</span><input v-model.trim="form.contactEmail" type="email" required /></label>
              <label class="form-field"><span>Contact number</span><input v-model.trim="form.contactNumber" type="tel" required /></label>
            </div>
          </section>

          <section class="form-section">
            <div class="form-section-heading">
              <span>2</span>
              <div><h2>Traveler information</h2><p>Names should match each traveler’s valid identification.</p></div>
            </div>
            <div v-for="(passenger, index) in form.passengerDetails" :key="index" class="passenger-block">
              <h3>Traveler {{ index + 1 }} <span v-if="index === 0">Primary</span></h3>
              <div class="form-grid form-grid--two">
                <label class="form-field"><span>First name</span><input v-model.trim="passenger.firstName" type="text" required /></label>
                <label class="form-field"><span>Last name</span><input v-model.trim="passenger.lastName" type="text" required /></label>
                <label class="form-field"><span>Date of birth</span><input v-model="passenger.birthDate" type="date" :max="today" required /></label>
                <label class="form-field"><span>Nationality</span><input v-model.trim="passenger.nationality" type="text" required /></label>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="form-section-heading">
              <span>3</span>
              <div><h2>Payment status</h2><p>Choose the payment method sent with this booking request.</p></div>
            </div>
            <div class="payment-options">
              <label :class="{ active: form.paymentMethod === 'card' }">
                <input v-model="form.paymentMethod" type="radio" value="card" />
                <i class="bi bi-credit-card"></i>
                <span><strong>Card</strong><small>Payment integration placeholder</small></span>
              </label>
              <label :class="{ active: form.paymentMethod === 'pay-later' }">
                <input v-model="form.paymentMethod" type="radio" value="pay-later" />
                <i class="bi bi-clock"></i>
                <span><strong>Pay later</strong><small>Backend determines final status</small></span>
              </label>
            </div>

            <div v-if="form.paymentMethod === 'card'" class="card-fields">
              <label class="form-field"><span>Name on card</span><input v-model.trim="form.cardName" type="text" autocomplete="cc-name" required /></label>
              <label class="form-field"><span>Card number</span><input v-model.trim="form.cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" required /></label>
              <div class="form-grid form-grid--two">
                <label class="form-field"><span>Expiry</span><input v-model.trim="form.expiry" type="text" placeholder="MM/YY" required /></label>
                <label class="form-field"><span>CVV</span><input v-model.trim="form.cvv" type="password" inputmode="numeric" maxlength="4" required /></label>
              </div>
              <p class="security-note"><i class="bi bi-shield-lock"></i> Card fields are not included in the booking API request.</p>
            </div>
          </section>

          <label class="check-row terms-row booking-terms">
            <input v-model="form.accepted" type="checkbox" required />
            <span>I confirm that the traveler details are correct.</span>
          </label>

          <button class="btn btn-dark btn-lg w-100" type="submit" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm"></span>
            {{ submitting ? "Confirming…" : `Confirm booking · ${formatCurrency(total)}` }}
          </button>
        </form>

        <BookingSummary :flight="flight" :passengers="passengers" :cabin="cabin" :total="total" />
      </div>
    </div>

    <div v-else class="container-xl section-block">
      <EmptyState icon="bi-airplane-engines" title="Flight not found" :description="error || 'This flight may have been removed or is no longer available.'">
        <RouterLink class="btn btn-dark" :to="{ name: 'flights' }">Browse flights</RouterLink>
      </EmptyState>
    </div>
  </div>
</template>
