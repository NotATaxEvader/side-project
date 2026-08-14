import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    toast: null,
    toastTimer: null,
  }),
  actions: {
    notify(message, type = "success") {
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toast = { message, type };
      this.toastTimer = setTimeout(() => {
        this.toast = null;
      }, 3600);
    },
    dismissToast() {
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toast = null;
    },
  },
});
