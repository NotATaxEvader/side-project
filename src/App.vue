<script setup>
import { onMounted } from "vue";
import NavbarComponent from "./components/NavbarComponent.vue";
import FooterComponent from "./components/FooterComponent.vue";
import AppToast from "./components/AppToast.vue";
import { useAuthStore } from "./stores/auth";
import { useFlightsStore } from "./stores/flights";
import { useBookingsStore } from "./stores/bookings";

const authStore = useAuthStore();
const flightsStore = useFlightsStore();
const bookingsStore = useBookingsStore();

onMounted(async () => {
  await Promise.allSettled([authStore.initialize(), flightsStore.initialize()]);
  if (authStore.isAuthenticated) {
    await bookingsStore.initialize().catch(() => {});
  }
});
</script>

<template>
  <div class="app-shell">
    <NavbarComponent />
    <main class="app-main">
      <RouterView />
    </main>
    <FooterComponent />
    <AppToast />
  </div>
</template>
