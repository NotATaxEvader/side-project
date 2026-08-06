import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import FlightsPage from "../pages/FlightsPage.vue";
import BookingPage from "../pages/BookingPage.vue";
import BookingDetailsPage from "../pages/BookingDetailsPage.vue";
import MyBookingsPage from "../pages/MyBookingsPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import AdminPage from "../pages/AdminPage.vue";
import NotFoundPage from "../pages/NotFoundPage.vue";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/flights", name: "flights", component: FlightsPage },
  { path: "/booking/:flightId", name: "booking", component: BookingPage, meta: { requiresAuth: true } },
  { path: "/bookings", name: "my-bookings", component: MyBookingsPage, meta: { requiresAuth: true } },
  { path: "/bookings/:bookingId", name: "booking-details", component: BookingDetailsPage, meta: { requiresAuth: true } },
  { path: "/profile", name: "profile", component: ProfilePage, meta: { requiresAuth: true } },
  { path: "/login", name: "login", component: LoginPage, meta: { guestOnly: true } },
  { path: "/register", name: "register", component: RegisterPage, meta: { guestOnly: true } },
  { path: "/admin", name: "admin", component: AdminPage, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.initialize();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) return { name: "home" };
  if (to.meta.guestOnly && authStore.isAuthenticated) return { name: "home" };
  return true;
});

export default router;
