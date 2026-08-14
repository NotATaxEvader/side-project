<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useBookingsStore } from "../stores/bookings";
import { useFlightsStore } from "../stores/flights";
import { useUiStore } from "../stores/ui";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

const authStore = useAuthStore();
const bookingsStore = useBookingsStore();
const flightsStore = useFlightsStore();
const uiStore = useUiStore();

const activeTab = ref("overview");
const flightModalOpen = ref(false);
const airlineModalOpen = ref(false);
const adminError = ref("");
const loadError = ref("");
const search = ref("");

function dateTimeInput(hoursFromNow = 24) {
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

const emptyFlight = () => ({
  id: "",
  airlineId: flightsStore.airlines[0]?.id || "",
  flightNumber: "",
  departure: "MNL",
  destination: "NRT",
  departureDate: dateTimeInput(24),
  arrivalDate: dateTimeInput(29),
  price: 6000,
  ecoSeatsAvailable: 30,
  busSeatsAvailable: 6,
  isDirect: true,
  status: "Scheduled",
});
const flightForm = reactive(emptyFlight());
const airlineForm = reactive({ id: "", name: "", code: "", rating: 4.0 });

onMounted(async () => {
  const results = await Promise.allSettled([
    flightsStore.initialize(true),
    bookingsStore.fetchAllBookings(),
    authStore.fetchUsers(),
  ]);
  const failed = results.find((result) => result.status === "rejected");
  if (failed) loadError.value = failed.reason?.message || "Some admin data could not be loaded.";
});

const metrics = computed(() => ({
  flights: flightsStore.flights.length,
  activeBookings: bookingsStore.bookings.filter((booking) => booking.status !== "Cancelled").length,
  revenue: bookingsStore.bookings.filter((booking) => booking.status === "Paid").reduce((total, booking) => total + booking.totalPrice, 0),
  users: authStore.users.length,
}));

const filteredFlights = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return flightsStore.flights;
  return flightsStore.flights.filter((flight) => {
    const airline = flight.airline || flightsStore.getAirlineById(flight.airlineId);
    return [flight.flightNumber, flight.departure, flight.destination, airline?.name].some((value) => value?.toLowerCase().includes(query));
  });
});

function resetFlightForm() {
  Object.assign(flightForm, emptyFlight());
  adminError.value = "";
}

function openNewFlight() {
  if (!flightsStore.airlines.length) {
    activeTab.value = "airlines";
    uiStore.notify("Add an airline before creating a flight.", "error");
    return;
  }
  resetFlightForm();
  flightModalOpen.value = true;
}

function editFlight(flight) {
  Object.assign(flightForm, {
    ...flight,
    departureDate: flight.departureDate?.slice(0, 16),
    arrivalDate: flight.arrivalDate?.slice(0, 16),
  });
  adminError.value = "";
  flightModalOpen.value = true;
}

async function saveFlight() {
  adminError.value = "";
  if (flightForm.departure === flightForm.destination) {
    adminError.value = "Departure and destination must be different.";
    return;
  }
  if (new Date(flightForm.arrivalDate) <= new Date(flightForm.departureDate)) {
    adminError.value = "Arrival must be later than departure.";
    return;
  }
  try {
    const wasEditing = Boolean(flightForm.id);
    await flightsStore.saveFlight({ ...flightForm });
    flightModalOpen.value = false;
    uiStore.notify(wasEditing ? "Flight updated." : "Flight added.");
  } catch (error) {
    adminError.value = error.message;
  }
}

async function deleteFlight(id) {
  if (!window.confirm("Delete this flight?")) return;
  try {
    await flightsStore.deleteFlight(id);
    uiStore.notify("Flight deleted.");
  } catch (error) {
    uiStore.notify(error.message, "error");
  }
}

function openNewAirline() {
  Object.assign(airlineForm, { id: "", name: "", code: "", rating: 4.0 });
  adminError.value = "";
  airlineModalOpen.value = true;
}

function editAirline(airline) {
  Object.assign(airlineForm, airline);
  adminError.value = "";
  airlineModalOpen.value = true;
}

async function saveAirline() {
  adminError.value = "";
  try {
    const wasEditing = Boolean(airlineForm.id);
    await flightsStore.saveAirline({ ...airlineForm, code: airlineForm.code.toUpperCase() });
    airlineModalOpen.value = false;
    uiStore.notify(wasEditing ? "Airline updated." : "Airline added.");
  } catch (error) {
    adminError.value = error.message;
  }
}

async function deleteAirline(id) {
  if (!window.confirm("Delete this airline?")) return;
  try {
    await flightsStore.deleteAirline(id);
    uiStore.notify("Airline deleted.");
  } catch (error) {
    uiStore.notify(error.message, "error");
  }
}

async function updateRole(user, event) {
  const previousRole = user.role;
  try {
    await authStore.setUserRole(user.id, event.target.value);
    uiStore.notify(`${user.firstName}'s role was updated.`);
  } catch (error) {
    event.target.value = previousRole;
    uiStore.notify(error.message, "error");
  }
}

async function markPaid(booking) {
  try {
    await bookingsStore.markPaid(booking.id);
    uiStore.notify("Booking marked as paid.");
  } catch (error) {
    uiStore.notify(error.message, "error");
  }
}
</script>

<template>
  <div class="page-shell page-shell--muted admin-page">
    <section class="container-xl dashboard-header dashboard-header--admin">
      <div>
        <span class="eyebrow">Administration</span>
        <h1>Operations dashboard</h1>
        <p>Manage backend flight inventory, airline records, user roles, and booking statuses.</p>
      </div>
    </section>

    <div class="container-xl admin-shell">
      <aside class="admin-sidebar">
        <button :class="{ active: activeTab === 'overview' }" type="button" @click="activeTab = 'overview'"><i class="bi bi-grid"></i> Overview</button>
        <button :class="{ active: activeTab === 'flights' }" type="button" @click="activeTab = 'flights'"><i class="bi bi-airplane"></i> Flights</button>
        <button :class="{ active: activeTab === 'airlines' }" type="button" @click="activeTab = 'airlines'"><i class="bi bi-building"></i> Airlines</button>
        <button :class="{ active: activeTab === 'bookings' }" type="button" @click="activeTab = 'bookings'"><i class="bi bi-ticket-perforated"></i> Bookings</button>
        <button :class="{ active: activeTab === 'users' }" type="button" @click="activeTab = 'users'"><i class="bi bi-people"></i> Users</button>
      </aside>

      <main class="admin-content">
        <div v-if="loadError" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ loadError }}</div>
        <section v-if="activeTab === 'overview'">
          <div class="admin-section-heading">
            <div><h2>Overview</h2><p>A snapshot of the data returned by the connected backend.</p></div>
          </div>
          <div class="metric-grid">
            <article><span class="metric-icon"><i class="bi bi-airplane"></i></span><div><strong>{{ metrics.flights }}</strong><span>Flights</span></div></article>
            <article><span class="metric-icon"><i class="bi bi-ticket-perforated"></i></span><div><strong>{{ metrics.activeBookings }}</strong><span>Active bookings</span></div></article>
            <article><span class="metric-icon"><i class="bi bi-wallet2"></i></span><div><strong>{{ formatCurrency(metrics.revenue) }}</strong><span>Recorded revenue</span></div></article>
            <article><span class="metric-icon"><i class="bi bi-people"></i></span><div><strong>{{ metrics.users }}</strong><span>Registered users</span></div></article>
          </div>

          <div class="admin-overview-grid">
            <section class="admin-panel">
              <div class="panel-heading"><h3>Recent bookings</h3><button type="button" @click="activeTab = 'bookings'">View all</button></div>
              <div v-if="bookingsStore.bookings.length" class="simple-list">
                <div v-for="booking in bookingsStore.bookings.slice(-5).reverse()" :key="booking.id">
                  <span class="list-icon"><i class="bi bi-ticket"></i></span>
                  <div><strong>{{ booking.reference }}</strong><small>{{ formatDate(booking.bookingDate) }} · {{ booking.passengers }} traveler(s)</small></div>
                  <span class="status-badge" :class="`status-${booking.status.toLowerCase()}`">{{ booking.status }}</span>
                </div>
              </div>
              <p v-else class="admin-empty">No bookings have been created yet.</p>
            </section>

            <section class="admin-panel">
              <div class="panel-heading"><h3>Inventory health</h3><button type="button" @click="activeTab = 'flights'">Manage</button></div>
              <div class="health-list">
                <div><span>Scheduled flights</span><strong>{{ flightsStore.flights.filter((flight) => flight.status === 'Scheduled').length }}</strong></div>
                <div><span>Low economy inventory</span><strong>{{ flightsStore.flights.filter((flight) => flight.ecoSeatsAvailable < 20).length }}</strong></div>
                <div><span>Business cabin routes</span><strong>{{ flightsStore.flights.filter((flight) => flight.busSeatsAvailable > 0).length }}</strong></div>
                <div><span>Airlines represented</span><strong>{{ flightsStore.airlines.length }}</strong></div>
              </div>
            </section>
          </div>
        </section>

        <section v-if="activeTab === 'flights'">
          <div class="admin-section-heading admin-section-heading--actions">
            <div><h2>Flights</h2><p>Create, update, and remove backend flight records.</p></div>
            <button class="btn btn-dark" type="button" @click="openNewFlight"><i class="bi bi-plus-lg"></i> Add flight</button>
          </div>
          <div class="table-toolbar">
            <label><i class="bi bi-search"></i><input v-model="search" type="search" placeholder="Search flight, route, or airline" /></label>
            <span>{{ filteredFlights.length }} records</span>
          </div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead><tr><th>Flight</th><th>Route</th><th>Departure</th><th>Fare</th><th>Seats</th><th>Status</th><th></th></tr></thead>
              <tbody>
                <tr v-for="flight in filteredFlights" :key="flight.id">
                  <td><strong>{{ flight.flightNumber }}</strong><span>{{ flight.airline?.name || flightsStore.getAirlineById(flight.airlineId)?.name || "Airline" }}</span></td>
                  <td><strong>{{ flight.departure }} → {{ flight.destination }}</strong><span>{{ flight.isDirect ? "Direct" : "1 stop" }}</span></td>
                  <td><strong>{{ formatDate(flight.departureDate) }}</strong><span>{{ formatTime(flight.departureDate) }}</span></td>
                  <td>{{ formatCurrency(flight.price) }}</td>
                  <td><strong>{{ flight.ecoSeatsAvailable }} eco</strong><span>{{ flight.busSeatsAvailable }} business</span></td>
                  <td><span class="status-badge status-paid">{{ flight.status }}</span></td>
                  <td class="table-actions"><button type="button" aria-label="Edit flight" @click="editFlight(flight)"><i class="bi bi-pencil"></i></button><button type="button" aria-label="Delete flight" @click="deleteFlight(flight.id)"><i class="bi bi-trash"></i></button></td>
                </tr>
              <tr v-if="!filteredFlights.length"><td colspan="7" class="table-empty">No flights are available.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="activeTab === 'airlines'">
          <div class="admin-section-heading admin-section-heading--actions">
            <div><h2>Airlines</h2><p>Maintain the airlines available to flight records.</p></div>
            <button class="btn btn-dark" type="button" @click="openNewAirline"><i class="bi bi-plus-lg"></i> Add airline</button>
          </div>
          <div class="airline-admin-grid">
            <article v-for="airline in flightsStore.airlines" :key="airline.id" class="airline-admin-card">
              <span class="airline-logo airline-logo--large">{{ airline.code }}</span>
              <div><h3>{{ airline.name }}</h3><p><i class="bi bi-star-fill"></i> {{ airline.rating }} rating</p><span>{{ flightsStore.flights.filter((flight) => flight.airlineId === airline.id).length }} flights</span></div>
              <div class="airline-actions"><button type="button" @click="editAirline(airline)"><i class="bi bi-pencil"></i></button><button type="button" @click="deleteAirline(airline.id)"><i class="bi bi-trash"></i></button></div>
            </article>
          </div>
          <p v-if="!flightsStore.airlines.length" class="admin-empty">No airlines are available.</p>
        </section>

        <section v-if="activeTab === 'bookings'">
          <div class="admin-section-heading"><div><h2>Bookings</h2><p>Review reservations and payment states returned by the backend.</p></div></div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead><tr><th>Reference</th><th>User</th><th>Flight</th><th>Booked</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                <tr v-for="booking in [...bookingsStore.bookings].reverse()" :key="booking.id">
                  <td><strong>{{ booking.reference }}</strong><span>{{ booking.passengers }} traveler(s)</span></td>
                  <td>{{ booking.user?.email || authStore.users.find((user) => user.id === booking.userId)?.email || "Unknown" }}</td>
                  <td>{{ booking.flight?.flightNumber || flightsStore.getFlightById(booking.flightId)?.flightNumber || "Removed flight" }}</td>
                  <td>{{ formatDate(booking.bookingDate) }}</td>
                  <td>{{ formatCurrency(booking.totalPrice) }}</td>
                  <td><span class="status-badge" :class="`status-${booking.status.toLowerCase()}`">{{ booking.status }}</span></td>
                  <td class="table-actions"><button v-if="booking.status === 'Pending'" type="button" title="Mark paid" @click="markPaid(booking)"><i class="bi bi-check2-circle"></i></button><RouterLink :to="{ name: 'booking-details', params: { bookingId: booking.id } }"><i class="bi bi-box-arrow-up-right"></i></RouterLink></td>
                </tr>
                <tr v-if="!bookingsStore.bookings.length"><td colspan="7" class="table-empty">No bookings have been created.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="activeTab === 'users'">
          <div class="admin-section-heading"><div><h2>Users</h2><p>View registered accounts and update access roles.</p></div></div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>Joined</th><th>Role</th></tr></thead>
              <tbody>
                <tr v-for="user in authStore.users" :key="user.id">
                  <td><strong>{{ user.firstName }} {{ user.lastName }}</strong><span>{{ user.id }}</span></td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.contactNumber }}</td>
                  <td>{{ formatDate(user.dateCreated) }}</td>
                  <td><select :value="user.role" :disabled="user.id === authStore.currentUser.id" @change="updateRole(user, $event)"><option value="user">User</option><option value="admin">Admin</option></select></td>
                </tr>
                <tr v-if="!authStore.users.length"><td colspan="5" class="table-empty">No users are available.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <div v-if="flightModalOpen" class="modal-backdrop-custom" @click.self="flightModalOpen = false">
      <section class="app-modal" role="dialog" aria-modal="true" aria-labelledby="flight-modal-title">
        <div class="modal-heading"><div><span class="eyebrow">Flight record</span><h2 id="flight-modal-title">{{ flightForm.id ? "Edit flight" : "Add flight" }}</h2></div><button type="button" aria-label="Close" @click="flightModalOpen = false"><i class="bi bi-x-lg"></i></button></div>
        <form class="form-stack" @submit.prevent="saveFlight">
          <div v-if="adminError" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ adminError }}</div>
          <div class="form-grid form-grid--two">
            <label class="form-field"><span>Airline</span><select v-model="flightForm.airlineId" required><option v-for="airline in flightsStore.airlines" :key="airline.id" :value="airline.id">{{ airline.name }}</option></select></label>
            <label class="form-field"><span>Flight number</span><input v-model.trim="flightForm.flightNumber" type="text" placeholder="PR 428" required /></label>
            <label class="form-field"><span>Departure</span><select v-model="flightForm.departure" required><option v-for="airport in flightsStore.airports" :key="airport.code" :value="airport.code">{{ airport.city }} ({{ airport.code }})</option></select></label>
            <label class="form-field"><span>Destination</span><select v-model="flightForm.destination" required><option v-for="airport in flightsStore.airports" :key="airport.code" :value="airport.code">{{ airport.city }} ({{ airport.code }})</option></select></label>
            <label class="form-field"><span>Departure date and time</span><input v-model="flightForm.departureDate" type="datetime-local" required /></label>
            <label class="form-field"><span>Arrival date and time</span><input v-model="flightForm.arrivalDate" type="datetime-local" required /></label>
            <label class="form-field"><span>Base economy fare</span><input v-model.number="flightForm.price" type="number" min="1" required /></label>
            <label class="form-field"><span>Status</span><select v-model="flightForm.status"><option>Scheduled</option><option>Delayed</option><option>Cancelled</option></select></label>
            <label class="form-field"><span>Economy seats</span><input v-model.number="flightForm.ecoSeatsAvailable" type="number" min="0" required /></label>
            <label class="form-field"><span>Business seats</span><input v-model.number="flightForm.busSeatsAvailable" type="number" min="0" required /></label>
          </div>
          <label class="check-row"><input v-model="flightForm.isDirect" type="checkbox" /><span>Direct flight</span></label>
          <div class="modal-actions"><button class="btn btn-ghost" type="button" @click="flightModalOpen = false">Cancel</button><button class="btn btn-dark" type="submit">{{ flightForm.id ? "Save changes" : "Add flight" }}</button></div>
        </form>
      </section>
    </div>

    <div v-if="airlineModalOpen" class="modal-backdrop-custom" @click.self="airlineModalOpen = false">
      <section class="app-modal app-modal--small" role="dialog" aria-modal="true" aria-labelledby="airline-modal-title">
        <div class="modal-heading"><div><span class="eyebrow">Airline record</span><h2 id="airline-modal-title">{{ airlineForm.id ? "Edit airline" : "Add airline" }}</h2></div><button type="button" aria-label="Close" @click="airlineModalOpen = false"><i class="bi bi-x-lg"></i></button></div>
        <form class="form-stack" @submit.prevent="saveAirline">
          <div v-if="adminError" class="form-alert"><i class="bi bi-exclamation-circle"></i>{{ adminError }}</div>
          <label class="form-field"><span>Airline name</span><input v-model.trim="airlineForm.name" type="text" required /></label>
          <div class="form-grid form-grid--two">
            <label class="form-field"><span>Code</span><input v-model.trim="airlineForm.code" type="text" maxlength="3" required /></label>
            <label class="form-field"><span>Rating</span><input v-model.number="airlineForm.rating" type="number" min="1" max="5" step="0.1" required /></label>
          </div>
          <div class="modal-actions"><button class="btn btn-ghost" type="button" @click="airlineModalOpen = false">Cancel</button><button class="btn btn-dark" type="submit">Save airline</button></div>
        </form>
      </section>
    </div>
  </div>
</template>
