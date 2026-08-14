<script setup>
import { useUiStore } from "../stores/ui";

const uiStore = useUiStore();
</script>

<template>
  <Transition name="toast">
    <div v-if="uiStore.toast" class="app-toast" :class="`app-toast--${uiStore.toast.type}`" role="status" aria-live="polite">
      <i :class="uiStore.toast.type === 'error' ? 'bi bi-exclamation-circle' : 'bi bi-check-circle'"></i>
      <span>{{ uiStore.toast.message }}</span>
      <button type="button" class="toast-close" aria-label="Dismiss notification" @click="uiStore.dismissToast">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </Transition>
</template>
