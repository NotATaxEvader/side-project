<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { useBookingsStore } from "../stores/bookings";

const authStore = useAuthStore();
const uiStore = useUiStore();
const bookingsStore = useBookingsStore();
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const accountOpen = ref(false);

watch(() => route.fullPath, () => {
  menuOpen.value = false;
  accountOpen.value = false;
});

function logout() {
  authStore.logout();
  bookingsStore.clear();
  uiStore.notify("You have been logged out.");
  router.push({ name: "home" });
}
</script>

<template>
  <header class="site-header">
    <nav class="site-nav container-xl" aria-label="Main navigation">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="Altitude home">
        <span class="brand-mark"><i class="bi bi-arrow-up-right"></i></span>
        <span>Altitude</span>
      </RouterLink>

      <button class="nav-toggle" type="button" :aria-expanded="menuOpen" aria-controls="main-menu" @click="menuOpen = !menuOpen">
        <i :class="menuOpen ? 'bi bi-x-lg' : 'bi bi-list'"></i>
        <span class="visually-hidden">Toggle navigation</span>
      </button>

      <div id="main-menu" class="nav-content" :class="{ 'is-open': menuOpen }">
        <div class="nav-links">
          <RouterLink class="nav-link" :to="{ name: 'flights' }">Flights</RouterLink>
          <RouterLink v-if="authStore.isAuthenticated" class="nav-link" :to="{ name: 'my-bookings' }">My bookings</RouterLink>
          <RouterLink v-if="authStore.isAdmin" class="nav-link" :to="{ name: 'admin' }">Admin</RouterLink>
        </div>

        <div class="nav-actions">
          <template v-if="!authStore.isAuthenticated">
            <RouterLink class="btn btn-ghost btn-sm" :to="{ name: 'login' }">Log in</RouterLink>
            <RouterLink class="btn btn-dark btn-sm" :to="{ name: 'register' }">Create account</RouterLink>
          </template>

          <div v-else class="account-menu">
            <button type="button" class="account-button" :aria-expanded="accountOpen" @click="accountOpen = !accountOpen">
              <span class="account-avatar">{{ authStore.displayName.charAt(0).toUpperCase() }}</span>
              <span class="account-name">{{ authStore.displayName }}</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <div v-if="accountOpen" class="account-dropdown">
              <RouterLink :to="{ name: 'profile' }"><i class="bi bi-person"></i> Profile</RouterLink>
              <RouterLink :to="{ name: 'my-bookings' }"><i class="bi bi-ticket-perforated"></i> My bookings</RouterLink>
              <button type="button" @click="logout"><i class="bi bi-box-arrow-right"></i> Log out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
