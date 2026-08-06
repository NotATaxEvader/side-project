<script setup>
import { computed } from "vue";
import FlightSearch from "../components/FlightSearch.vue";
import FAQSection from "../components/FAQSection.vue";
import EmptyState from "../components/EmptyState.vue";
import { useFlightsStore } from "../stores/flights";
import { formatCurrency } from "../utils/formatters";

const flightsStore = useFlightsStore();

const destinationNotes = {
  NRT: "Food, neighborhoods, and big-city energy.",
  ICN: "Design districts, cafés, and easy day trips.",
  SIN: "A compact city break with world-class transit.",
  HKG: "Harbor views, food streets, and quick connections.",
  BKK: "Markets, temples, and a lively urban escape.",
  TPE: "Night markets, mountain views, and friendly streets.",
};

const featuredDestinations = computed(() => {
  const byDestination = new Map();
  for (const flight of flightsStore.flights) {
    const existing = byDestination.get(flight.destination);
    if (!existing || flight.price < existing.price) byDestination.set(flight.destination, flight);
  }

  return [...byDestination.values()]
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)
    .map((flight) => ({
      city: flightsStore.airportByCode(flight.destination)?.city || flight.destination,
      code: flight.destination,
      from: flight.departure,
      date: flight.departureDate?.slice(0, 10),
      price: flight.price,
      note: destinationNotes[flight.destination] || "Explore an available route from the current flight inventory.",
    }));
});
</script>

<template>
  <div>
    <section class="hero-section">
      <div class="container-xl hero-grid">
        <div class="hero-copy">
          <span class="eyebrow eyebrow--light">Flight search, simplified</span>
          <h1>Wherever you’re going, start clearly.</h1>
          <p>Compare available flights, reserve seats, and manage your trip in one focused Vue.js experience.</p>
        </div>
        <div class="hero-orbit" aria-hidden="true">
          <div class="orbit-circle orbit-circle--large"></div>
          <div class="orbit-circle orbit-circle--small"></div>
          <i class="bi bi-airplane-fill"></i>
          <span class="orbit-code orbit-code--one">MNL</span>
          <span class="orbit-code orbit-code--two">NRT</span>
        </div>
      </div>
    </section>

    <div class="container-xl search-overlap">
      <FlightSearch />
    </div>

    <section class="container-xl section-block section-block--intro">
      <div class="value-strip">
        <div><strong>{{ flightsStore.flights.length }}</strong><span>Available flights</span></div>
        <div><strong>{{ flightsStore.airlines.length }}</strong><span>Airline options</span></div>
        <div><strong>0</strong><span>Hidden fees</span></div>
        <div><strong>1</strong><span>Focused checkout</span></div>
      </div>
    </section>

    <section class="container-xl section-block" aria-labelledby="destinations-title">
      <div class="section-heading section-heading--split">
        <div>
          <span class="eyebrow">Popular right now</span>
          <h2 id="destinations-title">A few good places to begin</h2>
        </div>
        <p>Routes selected from the current backend flight inventory.</p>
      </div>
      <div v-if="featuredDestinations.length" class="destination-grid">
        <RouterLink
          v-for="destination in featuredDestinations"
          :key="`${destination.from}-${destination.code}`"
          class="destination-card"
          :to="{ name: 'flights', query: { from: destination.from, to: destination.code, date: destination.date, passengers: 1, cabin: 'economy' } }"
        >
          <div class="destination-top">
            <span>{{ destination.from }}</span>
            <i class="bi bi-arrow-right"></i>
            <span>{{ destination.code }}</span>
          </div>
          <div>
            <h3>{{ destination.city }}</h3>
            <p>{{ destination.note }}</p>
          </div>
          <div class="destination-price">
            <span>From</span>
            <strong>{{ formatCurrency(destination.price) }}</strong>
          </div>
        </RouterLink>
      </div>
      <EmptyState
        v-else
        icon="bi-airplane"
        title="Routes will appear here"
        description="Featured destinations are populated automatically after the backend returns flight records."
      />
    </section>

    <section class="process-section">
      <div class="container-xl section-block">
        <div class="section-heading text-center">
          <span class="eyebrow eyebrow--light">How it works</span>
          <h2>From search to seat in three steps</h2>
        </div>
        <div class="process-grid">
          <article>
            <span>01</span>
            <i class="bi bi-search"></i>
            <h3>Search</h3>
            <p>Choose your route, travel date, passengers, and preferred cabin.</p>
          </article>
          <article>
            <span>02</span>
            <i class="bi bi-sliders"></i>
            <h3>Compare</h3>
            <p>Sort by price or schedule and narrow options by airline or stops.</p>
          </article>
          <article>
            <span>03</span>
            <i class="bi bi-check2-circle"></i>
            <h3>Book</h3>
            <p>Add passenger details, submit the booking, and keep the server-issued reference.</p>
          </article>
        </div>
      </div>
    </section>

    <div class="container-xl">
      <FAQSection />
    </div>
  </div>
</template>
