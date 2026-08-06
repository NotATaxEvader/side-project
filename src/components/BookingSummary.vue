<script setup>
import { computed } from "vue";
import { useFlightsStore } from "../stores/flights";
import { durationLabel, formatCurrency, formatDate, formatTime } from "../utils/formatters";

const props = defineProps({
  flight: { type: Object, required: true },
  passengers: { type: Number, default: 1 },
  cabin: { type: String, default: "economy" },
  total: { type: Number, required: true },
});

const flightsStore = useFlightsStore();
const airline = computed(() => props.flight.airline || flightsStore.getAirlineById(props.flight.airlineId));
const duration = computed(() => Math.round((new Date(props.flight.arrivalDate) - new Date(props.flight.departureDate)) / 60000));
</script>

<template>
  <aside class="booking-summary">
    <div class="summary-heading">
      <span class="airline-logo">{{ airline?.code }}</span>
      <div>
        <strong>{{ airline?.name }}</strong>
        <span>{{ flight.flightNumber }}</span>
      </div>
    </div>
    <div class="summary-date">{{ formatDate(flight.departureDate) }}</div>
    <div class="summary-route">
      <div>
        <strong>{{ formatTime(flight.departureDate) }}</strong>
        <span>{{ flight.departure }}</span>
      </div>
      <div class="summary-duration">
        <span>{{ durationLabel(duration) }}</span>
        <div></div>
        <small>{{ flight.isDirect ? "Direct" : "1 stop" }}</small>
      </div>
      <div class="text-end">
        <strong>{{ formatTime(flight.arrivalDate) }}</strong>
        <span>{{ flight.destination }}</span>
      </div>
    </div>
    <div class="summary-details">
      <div><span>Cabin</span><strong>{{ cabin === "business" ? "Business" : "Economy" }}</strong></div>
      <div><span>Travelers</span><strong>{{ passengers }}</strong></div>
      <div><span>Fare</span><strong>{{ formatCurrency(total) }}</strong></div>
    </div>
    <div class="summary-total">
      <span>Total</span>
      <strong>{{ formatCurrency(total) }}</strong>
      <small>Taxes and fees included</small>
    </div>
  </aside>
</template>
