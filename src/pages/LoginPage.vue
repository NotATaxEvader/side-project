<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";

const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const form = reactive({ email: "", password: "" });

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    const user = await authStore.login(form);
    uiStore.notify(`Welcome back, ${user.firstName}.`);
    await router.push(route.query.redirect || (user.role === "admin" ? { name: "admin" } : { name: "home" }));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <div class="auth-page">
    <section class="auth-panel auth-panel--visual">
      <RouterLink class="brand brand--light" :to="{ name: 'home' }">
        <span class="brand-mark"><i class="bi bi-arrow-up-right"></i></span>
        <span>Altitude</span>
      </RouterLink>
      <div>
        <span class="eyebrow eyebrow--light">Welcome back</span>
        <h1>Your next trip is still here.</h1>
        <p>Sign in to continue a booking, review your reservations, or access authorized management tools.</p>
      </div>
      <small>Flight booking portal</small>
    </section>

    <section class="auth-panel auth-panel--form">
      <div class="auth-form-wrap">
        <div class="auth-heading">
          <h2>Log in</h2>
          <p>Enter your account details below.</p>
        </div>


        <form class="form-stack" @submit.prevent="submit">
          <div v-if="error" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ error }}</div>
          <label class="form-field">
            <span>Email address</span>
            <input v-model.trim="form.email" type="email" autocomplete="email" placeholder="you@example.com" required />
          </label>
          <label class="form-field">
            <span>Password</span>
            <div class="password-field">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Enter your password" required />
              <button type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </label>
          <button class="btn btn-dark btn-lg w-100" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            {{ loading ? "Logging in…" : "Log in" }}
          </button>
        </form>

        <p class="auth-switch">New to Altitude? <RouterLink :to="{ name: 'register', query: route.query }">Create an account</RouterLink></p>
      </div>
    </section>
  </div>
</template>
