<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";

const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();
const route = useRoute();
const error = ref("");
const loading = ref(false);
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
  password: "",
  confirmPassword: "",
  accepted: false,
});

const passwordValid = computed(() => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password));

async function submit() {
  error.value = "";
  if (!passwordValid.value) {
    error.value = "Password must be at least 8 characters with one uppercase letter and one number.";
    return;
  }
  if (form.password !== form.confirmPassword) {
    error.value = "Passwords do not match.";
    return;
  }
  loading.value = true;
  try {
    await authStore.register(form);
    if (authStore.isAuthenticated) {
      uiStore.notify("Your account has been created.");
      await router.push(route.query.redirect || { name: "home" });
    } else {
      uiStore.notify("Your account has been created. You can now log in.");
      await router.push({ name: "login", query: route.query });
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-panel auth-panel--visual auth-panel--register">
      <RouterLink class="brand brand--light" :to="{ name: 'home' }">
        <span class="brand-mark"><i class="bi bi-arrow-up-right"></i></span>
        <span>Altitude</span>
      </RouterLink>
      <div>
        <span class="eyebrow eyebrow--light">Create an account</span>
        <h1>Keep every trip in one place.</h1>
        <p>Save your booking references, manage payment status, and review your trips when plans change.</p>
      </div>
      <small>Your account details are sent securely to the connected backend.</small>
    </section>

    <section class="auth-panel auth-panel--form">
      <div class="auth-form-wrap auth-form-wrap--wide">
        <div class="auth-heading">
          <h2>Get started</h2>
          <p>Create your traveler profile.</p>
        </div>
        <form class="form-stack" @submit.prevent="submit">
          <div v-if="error" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ error }}</div>
          <div class="form-grid form-grid--two">
            <label class="form-field"><span>First name</span><input v-model.trim="form.firstName" type="text" autocomplete="given-name" required /></label>
            <label class="form-field"><span>Last name</span><input v-model.trim="form.lastName" type="text" autocomplete="family-name" required /></label>
          </div>
          <label class="form-field"><span>Email address</span><input v-model.trim="form.email" type="email" autocomplete="email" required /></label>
          <label class="form-field"><span>Contact number</span><input v-model.trim="form.contactNumber" type="tel" autocomplete="tel" placeholder="09XXXXXXXXX" pattern="[0-9+ -]{7,15}" required /></label>
          <div class="form-grid form-grid--two">
            <label class="form-field">
              <span>Password</span>
              <input v-model="form.password" type="password" autocomplete="new-password" required />
              <small :class="{ 'text-success': passwordValid }">8+ characters, one uppercase letter, one number</small>
            </label>
            <label class="form-field"><span>Confirm password</span><input v-model="form.confirmPassword" type="password" autocomplete="new-password" required /></label>
          </div>
          <label class="check-row terms-row">
            <input v-model="form.accepted" type="checkbox" required />
            <span>I agree to the account and booking terms for this application.</span>
          </label>
          <button class="btn btn-dark btn-lg w-100" type="submit" :disabled="loading">
            {{ loading ? "Creating account…" : "Create account" }}
          </button>
        </form>
        <p class="auth-switch">Already registered? <RouterLink :to="{ name: 'login', query: route.query }">Log in</RouterLink></p>
      </div>
    </section>
  </div>
</template>
