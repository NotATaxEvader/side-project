export function unwrapPayload(payload, keys = []) {
  let value = payload;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    value = value.data ?? value.result ?? value;
  }
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return value;
}

export function entityId(entity) {
  if (entity === null || entity === undefined) return "";
  if (typeof entity === "string" || typeof entity === "number") return String(entity);
  return String(
    entity.id ?? entity._id ??
    entity.userID ?? entity.userId ??
    entity.flightID ?? entity.flightId ??
    entity.bookingID ?? entity.bookingId ??
    entity.airlineID ?? entity.airlineId ?? "",
  );
}

function titleCaseStatus(value, fallback) {
  if (!value) return fallback;
  const normalized = String(value).trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function normalizeUser(raw = {}) {
  const role = raw.role ?? (raw.isAdmin ? "admin" : "user");
  return {
    ...raw,
    id: entityId(raw),
    firstName: raw.firstName ?? raw.first_name ?? "",
    lastName: raw.lastName ?? raw.last_name ?? "",
    email: raw.email ?? "",
    contactNumber: raw.contactNumber ?? raw.mobileNo ?? raw.contact ?? raw.phone ?? "",
    role: String(role).toLowerCase(),
    dateCreated: raw.dateCreated ?? raw.createdAt ?? raw.created_at ?? null,
  };
}

export function normalizeAirline(raw = {}) {
  return {
    ...raw,
    id: entityId(raw),
    name: raw.name ?? raw.airlineName ?? "",
    code: raw.code ?? raw.iataCode ?? "",
    rating: Number(raw.rating ?? 0),
  };
}

export function normalizeFlight(raw = {}) {
  const airlineValue = raw.airlineId ?? raw.airlineID ?? raw.airline;
  const directValue = raw.isDirect;
  return {
    ...raw,
    id: entityId(raw),
    airlineId: entityId(airlineValue),
    airline: typeof airlineValue === "object" ? normalizeAirline(airlineValue) : raw.airline,
    flightNumber: raw.flightNumber ?? raw.number ?? "",
    departure: raw.departure ?? raw.departureLocation ?? "",
    destination: raw.destination ?? raw.arrivalLocation ?? "",
    departureDate: raw.departureDate ?? raw.departureTime ?? null,
    arrivalDate: raw.arrivalDate ?? raw.arrivalTime ?? null,
    price: Number(raw.price ?? 0),
    ecoSeatsAvailable: Number(raw.ecoSeatsAvailable ?? raw.ecoSeatAvailable ?? raw.economySeats ?? 0),
    busSeatsAvailable: Number(raw.busSeatsAvailable ?? raw.businessSeatsAvailable ?? raw.businessSeats ?? 0),
    isDirect: directValue === true || directValue === "true",
    status: titleCaseStatus(raw.status, "Scheduled"),
  };
}

export function normalizeBooking(raw = {}) {
  const userValue = raw.userId ?? raw.userID ?? raw.user;
  const flightValue = raw.flightId ?? raw.flightID ?? raw.flight;
  const passengerDetails = raw.passengerDetails ?? raw.passengersInfo ?? (Array.isArray(raw.passengers) ? raw.passengers : []);
  const passengerCount = Array.isArray(raw.passengers)
    ? raw.passengers.length
    : Number(raw.passengers ?? raw.passengerCount ?? passengerDetails.length ?? 1);

  return {
    ...raw,
    id: entityId(raw),
    reference: raw.reference ?? raw.bookingReference ?? raw.referenceNumber ?? entityId(raw),
    userId: entityId(userValue),
    user: typeof userValue === "object" ? normalizeUser(userValue) : raw.user,
    flightId: entityId(flightValue),
    flight: typeof flightValue === "object" ? normalizeFlight(flightValue) : raw.flight,
    passengers: Number.isFinite(passengerCount) ? passengerCount : 1,
    passengerDetails,
    cabin: String(raw.cabin ?? raw.cabinClass ?? "economy").toLowerCase(),
    totalPrice: Number(raw.totalPrice ?? raw.total ?? 0),
    status: titleCaseStatus(raw.status, "Pending"),
    paymentMethod: raw.paymentMethod ?? "pay-later",
    bookingDate: raw.bookingDate ?? raw.createdAt ?? raw.created_at ?? null,
  };
}
