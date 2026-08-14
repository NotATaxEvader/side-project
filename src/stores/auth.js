import { defineStore } from "pinia";
import { apiRequest, clearAccessToken, getAccessToken, setAccessToken } from "../services/api";
import { API_ENDPOINTS } from "../services/endpoints";
import { entityId, normalizeUser, unwrapPayload } from "../utils/normalizers";

function userFromResponse(payload) {
  const data = unwrapPayload(payload);
  return data?.user ? normalizeUser(data.user) : null;
}

function tokenFromResponse(payload) {
  const data = unwrapPayload(payload);
  return data?.accessToken ?? data?.access ?? data?.token ?? payload?.accessToken ?? payload?.access ?? payload?.token ?? null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    users: [],
    currentUser: null,
    accessToken: getAccessToken(),
    initialized: false,
    loading: false,
    error: "",
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser && state.accessToken),
    isAdmin: (state) => state.currentUser?.role === "admin",
    displayName: (state) => state.currentUser?.firstName || "Traveler",
  },
  actions: {
    async initialize() {
      const storedToken = getAccessToken();
      if (this.accessToken !== storedToken) {
        this.accessToken = storedToken;
        if (!storedToken) this.currentUser = null;
      }
      if (this.initialized) return this.currentUser;
      if (!this.accessToken) {
        this.currentUser = null;
        this.initialized = true;
        return null;
      }

      try {
        await this.fetchProfile();
      } catch {
        clearAccessToken();
        this.accessToken = null;
        this.currentUser = null;
      } finally {
        this.initialized = true;
      }
      return this.currentUser;
    },

    async fetchProfile() {
      const payload = await apiRequest(API_ENDPOINTS.profile);
      const data = unwrapPayload(payload);
      const rawUser = data?.user ?? data;
      if (!rawUser || typeof rawUser !== "object") {
        throw new Error("The profile endpoint did not return a user.");
      }
      this.currentUser = normalizeUser(rawUser);
      return this.currentUser;
    },

    async login(credentials) {
      this.loading = true;
      this.error = "";
      try {
        const payload = await apiRequest(API_ENDPOINTS.login, {
          method: "POST",
          body: {
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          },
        });
        const token = tokenFromResponse(payload);
        if (!token) throw new Error("The backend did not return an access token.");

        setAccessToken(token);
        this.accessToken = token;
        this.currentUser = userFromResponse(payload);
        if (!this.currentUser) await this.fetchProfile();
        this.initialized = true;
        return this.currentUser;
      } catch (error) {
        clearAccessToken();
        this.accessToken = null;
        this.currentUser = null;
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(payload) {
      this.loading = true;
      this.error = "";
      try {
        const response = await apiRequest(API_ENDPOINTS.register, {
          method: "POST",
          body: {
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            email: payload.email.trim().toLowerCase(),
            mobileNo: payload.contactNumber.trim(),
            password: payload.password,
          },
        });

        // Some backends log a user in immediately after registration. Support
        // that response, but do not invent a browser-only account when no token exists.
        const token = tokenFromResponse(response);
        if (token) {
          setAccessToken(token);
          this.accessToken = token;
          this.currentUser = userFromResponse(response);
          if (!this.currentUser) await this.fetchProfile();
          this.initialized = true;
        }
        return response;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      clearAccessToken();
      this.accessToken = null;
      this.currentUser = null;
      this.users = [];
      this.initialized = true;
    },

    async updateProfile(payload) {
      const response = await apiRequest(API_ENDPOINTS.profile, {
        method: "PATCH",
        body: {
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          email: payload.email.trim().toLowerCase(),
          contactNumber: payload.contactNumber.trim(),
        },
      });
      const data = unwrapPayload(response);
      const rawUser = data?.user ?? data;
      if (entityId(rawUser)) this.currentUser = normalizeUser(rawUser);
      else await this.fetchProfile();
      return this.currentUser;
    },

    async fetchUsers() {
      const response = await apiRequest(API_ENDPOINTS.users);
      const list = unwrapPayload(response, ["users"]);
      this.users = Array.isArray(list) ? list.map(normalizeUser) : [];
      return this.users;
    },

    async setUserRole(userId, role) {
      const response = await apiRequest(API_ENDPOINTS.userRole(userId), {
        method: "PATCH",
        body: { role },
      });
      const data = unwrapPayload(response);
      const rawUser = data?.user ?? data;
      const existing = this.users.find((user) => user.id === userId);
      const updated = entityId(rawUser)
        ? normalizeUser(rawUser)
        : { ...existing, id: userId, role };
      const index = this.users.findIndex((user) => user.id === userId);
      if (index !== -1) this.users.splice(index, 1, updated);
      if (this.currentUser?.id === userId) this.currentUser = updated;
      return updated;
    },
  },
});
