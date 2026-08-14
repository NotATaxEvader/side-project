<script setup>
import { computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { airports } from "../data/referenceData";
import { useFlightsStore } from "../stores/flights";
import { useUiStore } from "../stores/ui";

const props = defineProps({
  initialValues: { type: Object, default: () => ({}) },
  compact: { type: Boolean, default: false },
});

const emit = defineEmits(["search"]);
const router = useRouter();
const flightsStore = useFlightsStore();
const uiStore = useUiStore();

const form = reactive({
  from: props.initialValues.from || flightsStore.lastSearch.from || "ANY",
  to: props.initialValues.to || flightsStore.lastSearch.to || "ANY",
  departureDate: props.initialValues.departureDate || flightsStore.lastSearch.departureDate,
  passengers: Number(props.initialValues.passengers || flightsStore.lastSearch.passengers || 1),
  cabin: props.initialValues.cabin || flightsStore.lastSearch.cabin || "economy",
});

watch(() => props.initialValues, (values) => {
  Object.assign(form, values);
}, { deep: true });

const availableDestinations = computed(() => airports.filter((airport) => airport.code === "ANY" || airport.code !== form.from));
const today = new Date().toISOString().slice(0, 10);

function swapLocations() {
  [form.from, form.to] = [form.to, form.from];
}

function submitSearch() {
  if (form.from === form.to &&
      form.from !== "ANY" &&
      form.to !== "ANY") {
    uiStore.notify("Departure and destination must be different.", "error");
    return;
  }
  const criteria = { ...form, passengers: Number(form.passengers) };
  flightsStore.setLastSearch(criteria);
  emit("search", criteria);
  router.push({
    name: "flights",
    query: {
      from: criteria.from,
      to: criteria.to,
      date: criteria.departureDate,
      passengers: criteria.passengers,
      cabin: criteria.cabin,
    },
  });
}
</script>

<template>
  <form class="flight-search" :class="{ 'flight-search--compact': compact }" @submit.prevent="submitSearch">
    <div class="search-route-group">
      <label class="search-field">
        <span>From</span>
        <div class="search-control">
          <i class="bi bi-geo-alt"></i>
          <select v-model="form.from" aria-label="Departure airport">
            <option v-for="airport in airports" :key="airport.code" :value="airport.code">
              {{ airport.city }} ({{ airport.code }})
            </option>
          </select>
        </div>
      </label>

      <button type="button" class="swap-button" aria-label="Swap departure and destination" @click="swapLocations">
        <i class="bi bi-arrow-left-right"></i>
      </button>

      <label class="search-field">
        <span>To</span>
        <div class="search-control">
          <i class="bi bi-geo"></i>
          <select v-model="form.to" aria-label="Destination airport">
            <option v-for="airport in availableDestinations" :key="airport.code" :value="airport.code">
              {{ airport.city }} ({{ airport.code }})
            </option>
          </select>
        </div>
      </label>
    </div>

    <label class="search-field">
      <span>Departure</span>
      <div class="search-control">
        <i class="bi bi-calendar3"></i>
        <input v-model="form.departureDate" type="date" :min="today" required />
      </div>
    </label>

    <label class="search-field">
      <span>Travelers</span>
      <div class="search-control">
        <i class="bi bi-people"></i>
        <select v-model.number="form.passengers" aria-label="Number of passengers">
          <option v-for="count in 8" :key="count" :value="count">{{ count }} {{ count === 1 ? "traveler" : "travelers" }}</option>
        </select>
      </div>
    </label>

    <label class="search-field">
      <span>Cabin</span>
      <div class="search-control">
        <i class="bi bi-seat-recline-normal"></i>
        <select v-model="form.cabin" aria-label="Cabin class">
          <option value="economy">Economy</option>
          <option value="business">Business</option>
        </select>
      </div>
    </label>

    <button class="btn btn-dark search-submit" type="submit">
      <i class="bi bi-search"></i>
      <span>Search</span>
    </button>
  </form>
</template>
