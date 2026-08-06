<script setup>
defineProps({
  icon: { type: String, default: "bi-search" },
  title: { type: String, required: true },
  description: { type: String, required: true },
});
</script>

<template>
  <div class="empty-state">
    <span class="empty-icon"><i class="bi" :class="icon"></i></span>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>
