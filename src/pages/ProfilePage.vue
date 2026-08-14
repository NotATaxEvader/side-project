<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { formatDate } from "../utils/formatters";

const authStore = useAuthStore();
const uiStore = useUiStore();
const editing = ref(false);
const saving = ref(false);
const error = ref("");
const form = reactive({
  firstName: authStore.currentUser.firstName,
  lastName: authStore.currentUser.lastName,
  email: authStore.currentUser.email,
  contactNumber: authStore.currentUser.contactNumber,
});

function resetForm() {
  Object.assign(form, {
    firstName: authStore.currentUser.firstName,
    lastName: authStore.currentUser.lastName,
    email: authStore.currentUser.email,
    contactNumber: authStore.currentUser.contactNumber,
  });
  error.value = "";
}

function cancelEditing() {
  resetForm();
  editing.value = false;
}

async function save() {
  error.value = "";
  saving.value = true;
  try {
    await authStore.updateProfile(form);
    resetForm();
    editing.value = false;
    uiStore.notify("Profile updated.");
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="page-shell page-shell--muted">
    <section class="container-lg dashboard-header">
      <span class="eyebrow">Account</span>
      <h1>Your profile</h1>
      <p>Keep your primary contact information up to date.</p>
    </section>

    <div class="container-lg profile-layout">
      <aside class="profile-card">
        <span class="profile-avatar">{{ authStore.currentUser.firstName.charAt(0) }}{{ authStore.currentUser.lastName.charAt(0) }}</span>
        <h2>{{ authStore.currentUser.firstName }} {{ authStore.currentUser.lastName }}</h2>
        <p>{{ authStore.currentUser.email }}</p>
        <span class="role-badge">{{ authStore.currentUser.role }}</span>
        <small>Member since {{ formatDate(authStore.currentUser.dateCreated) }}</small>
      </aside>

      <section class="profile-form-panel">
        <div class="panel-heading">
          <div><h2>Personal information</h2><p>Used to prefill booking contact details.</p></div>
          <button v-if="!editing" class="btn btn-outline-dark btn-sm" type="button" @click="editing = true"><i class="bi bi-pencil"></i> Edit</button>
        </div>
        <form class="form-stack" @submit.prevent="save">
          <div v-if="error" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ error }}</div>
          <div class="form-grid form-grid--two">
            <label class="form-field"><span>First name</span><input v-model.trim="form.firstName" type="text" :disabled="!editing" required /></label>
            <label class="form-field"><span>Last name</span><input v-model.trim="form.lastName" type="text" :disabled="!editing" required /></label>
          </div>
          <label class="form-field"><span>Email address</span><input v-model.trim="form.email" type="email" :disabled="!editing" required /></label>
          <label class="form-field"><span>Contact number</span><input v-model.trim="form.contactNumber" type="tel" :disabled="!editing" required /></label>
          <div v-if="editing" class="profile-actions">
            <button class="btn btn-dark" type="submit" :disabled="saving">{{ saving ? "Saving…" : "Save changes" }}</button>
            <button class="btn btn-ghost" type="button" :disabled="saving" @click="cancelEditing">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
