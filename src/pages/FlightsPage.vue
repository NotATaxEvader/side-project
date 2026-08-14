<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import FlightSearch from "../components/FlightSearch.vue";
import FlightCard from "../components/FlightCard.vue";
import EmptyState from "../components/EmptyState.vue";
import { useFlightsStore } from "../stores/flights";
import { formatCurrency } from "../utils/formatters";

const route = useRoute();
const flightsStore = useFlightsStore();

const filtersOpen = ref(false);
const sortBy = ref("recommended");
const selectedAirlines = ref([]);
const stops = ref("any");
const maxPrice = ref(30000);

const criteria = reactive({
  from: route.query.from || flightsStore.lastSearch.from,
  to: route.query.to || flightsStore.lastSearch.to,
  departureDate: route.query.date || flightsStore.lastSearch.departureDate,
  passengers: Number(route.query.passengers || flightsStore.lastSearch.passengers || 1),
  cabin: route.query.cabin || flightsStore.lastSearch.cabin,
});

onMounted(() => flightsStore.initialize());

watch(() => route.query, (query) => {
  criteria.from = query.from || criteria.from;
  criteria.to = query.to || criteria.to;
  criteria.departureDate = query.date || criteria.departureDate;
  criteria.passengers = Number(query.passengers || criteria.passengers);
  criteria.cabin = query.cabin || criteria.cabin;
  selectedAirlines.value = [];
  stops.value = "any";
}, { deep: true });

const baseResults = computed(() => flightsStore.searchFlights(criteria));
const resultAirlines = computed(() => {
  const ids = [...new Set(baseResults.value.map((flight) => flight.airlineId))];
  return ids.map((id) => flightsStore.getAirlineById(id)).filter(Boolean);
});

if(criteria.from === "ANY" &&
   criteria.to === "ANY") {
    baseResults.value = computed(() => flightsStore.fetchFlights());
    console.log("IN THE IF STATEMENT")
}

const results = computed(() => {
  let items = baseResults.value.filter((flight) => {
    const multiplier = criteria.cabin === "business" ? 1.85 : 1;
    const total = flight.price * multiplier * criteria.passengers;
    const airlineMatch = !selectedAirlines.value.length || selectedAirlines.value.includes(flight.airlineId);
    const stopMatch = stops.value === "any" || (stops.value === "direct" ? flight.isDirect : !flight.isDirect);
    return airlineMatch && stopMatch && total <= maxPrice.value;
  });

  if (sortBy.value === "price") items = [...items].sort((a, b) => a.price - b.price);
  if (sortBy.value === "departure") items = [...items].sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate));
  if (sortBy.value === "duration") {
    items = [...items].sort((a, b) => (new Date(a.arrivalDate) - new Date(a.departureDate)) - (new Date(b.arrivalDate) - new Date(b.departureDate)));
  }
  return items;
});

const fromAirport = computed(() => flightsStore.airportByCode(criteria.from));
const toAirport = computed(() => flightsStore.airportByCode(criteria.to));

function resetFilters() {
  selectedAirlines.value = [];
  stops.value = "any";
  maxPrice.value = 30000;
}
</script>

<template>
  <div class="page-shell page-shell--muted">
    <section class="search-page-header">
      <div class="container-xl">
        <div class="page-title-row">
          <div>
            <span class="eyebrow">Flight results</span>
            <h1 v-if="criteria.from === 'ANY' && criteria.to === 'ANY'">All Flights</h1>
            <h1 v-else>{{ fromAirport?.city || criteria.from }} to {{ toAirport?.city || criteria.to }}</h1>
            <p>{{ criteria.departureDate }} · {{ criteria.passengers }} {{ criteria.passengers === 1 ? "traveler" : "travelers" }} · {{ criteria.cabin }}</p>
          </div>
        </div>
        <FlightSearch :initial-values="criteria" compact />
      </div>
    </section>

    <div class="container-xl results-layout">
      <aside class="filters-panel" :class="{ 'is-open': filtersOpen }">
        <div class="filter-heading">
          <h2>Filters</h2>
          <button type="button" @click="resetFilters">Reset</button>
        </div>

        <div class="filter-group">
          <h3>Stops</h3>
          <label class="radio-row"><input v-model="stops" type="radio" value="any" /> Any</label>
          <label class="radio-row"><input v-model="stops" type="radio" value="direct" /> Direct only</label>
          <label class="radio-row"><input v-model="stops" type="radio" value="stop" /> 1 stop</label>
        </div>

        <div class="filter-group">
          <h3>Airlines</h3>
          <label v-for="airline in resultAirlines" :key="airline.id" class="check-row">
            <input v-model="selectedAirlines" type="checkbox" :value="airline.id" />
            <span>{{ airline.name }}</span>
          </label>
          <p v-if="!resultAirlines.length" class="filter-empty">No airlines in this route.</p>
        </div>

        <div class="filter-group">
          <h3>Maximum total</h3>
          <strong>{{ formatCurrency(maxPrice) }}</strong>
          <input v-model.number="maxPrice" class="price-range" type="range" min="4000" max="30000" step="500" />
        </div>
      </aside>

      <section class="results-main" aria-live="polite">
        <div class="results-toolbar">
          <div>
            <strong>{{ results.length }} {{ results.length === 1 ? "flight" : "flights" }}</strong>
            <span>Prices include taxes and fees</span>
          </div>
          <div class="toolbar-actions">
            <button type="button" class="btn btn-outline-dark filter-toggle" @click="filtersOpen = !filtersOpen">
              <i class="bi bi-sliders"></i> Filters
            </button>
            <label class="sort-control">
              <span>Sort</span>
              <select v-model="sortBy">
                <option value="recommended">Recommended</option>
                <option value="price">Lowest price</option>
                <option value="departure">Earliest departure</option>
                <option value="duration">Shortest duration</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="flightsStore.loading" class="flight-list" aria-label="Loading flights">
          <article class="flight-card"><div class="p-4">Loading flights from the backend…</div></article>
        </div>

        <EmptyState
          v-else-if="flightsStore.error && !flightsStore.flights.length"
          icon="bi-cloud-slash"
          title="Flight data is unavailable"
          :description="flightsStore.error"
        >
          <button type="button" class="btn btn-outline-dark" @click="flightsStore.initialize(true)">Try again</button>
        </EmptyState>

        <div v-else-if="results.length" class="flight-list">
          <FlightCard
            v-for="flight in results"
            :key="flight.id"
            :flight="flight"
            :passengers="criteria.passengers"
            :cabin="criteria.cabin"
          />
        </div>

        <EmptyState
          v-else
          icon="bi-calendar-x"
          title="No flights match this search"
          description="Try a different date, route, cabin, or remove some filters."
        >
          <button type="button" class="btn btn-outline-dark" @click="resetFilters">Clear filters</button>
        </EmptyState>
      </section>
    </div>
  </div>
</template>
