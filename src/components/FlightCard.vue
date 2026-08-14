<script setup>
import { computed } from "vue";
import { useFlightsStore } from "../stores/flights";
import { durationLabel, formatCurrency, formatDate, formatTime } from "../utils/formatters";

const props = defineProps({
  flight: { type: Object, required: true },
  passengers: { type: Number, default: 1 },
  cabin: { type: String, default: "economy" },
});

const flightsStore = useFlightsStore();
const airline = computed(() => props.flight.airline || flightsStore.getAirlineById(props.flight.airlineId));
const duration = computed(() => Math.round((new Date(props.flight.arrivalDate) - new Date(props.flight.departureDate)) / 60000));
const total = computed(() => {
  const multiplier = props.cabin === "business" ? 1.85 : 1;
  return props.flight.price * multiplier * props.passengers;
});
const seats = computed(() => props.cabin === "business" ? props.flight.busSeatsAvailable : props.flight.ecoSeatsAvailable);
</script>

<template>
  <article class="flight-card">
    <div class="flight-airline">
      <span class="airline-logo">{{ airline?.code || "FL" }}</span>
      <div>
        <strong>{{ airline?.name || "Airline" }}</strong>
        <span>{{ flight.flightNumber }}</span>
      </div>
    </div>

    <div class="flight-route">
      <div class="flight-time">
        <strong>{{ formatTime(flight.departureDate) }}</strong>
        <span>{{ flight.departure }}</span>
      </div>
      <div class="route-line">
        <span>{{ durationLabel(duration) }}</span>
        <div><i class="bi bi-airplane"></i></div>
        <small>{{ flight.isDirect ? "Direct" : "1 stop" }}</small>
      </div>
      <div class="flight-time flight-time--right">
        <strong>{{ formatTime(flight.arrivalDate) }}</strong>
        <span>{{ flight.destination }}</span>
      </div>
    </div>

    <div class="flight-meta-mobile">
      <span>{{ formatDate(flight.departureDate, { year: undefined }) }}</span>
      <span>{{ seats }} seats left</span>
    </div>

    <div class="flight-price">
      <span>{{ cabin === "business" ? "Business" : "Economy" }} · {{ passengers }} {{ passengers === 1 ? "traveler" : "travelers" }}</span>
      <strong>{{ formatCurrency(total) }}</strong>
      <small>Total, taxes included</small>
      <RouterLink class="btn btn-dark" :to="{ name: 'booking', params: { flightId: flight.id }, query: { passengers, cabin } }">
        Select flight
      </RouterLink>
    </div>
  </article>
</template>
