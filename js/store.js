// SafeBite - tiny storage helper
// Saves data in localStorage and tells other open tabs when something changes.

const PROFILE_KEY = "safebite_profile";
const ORDERS_KEY = "safebite_orders";

// BroadcastChannel is not in every browser, so check first
const channel = ("BroadcastChannel" in window) ? new BroadcastChannel("safebite") : null;

// Read JSON from localStorage (returns fallback if empty or broken)
function readData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Save JSON to localStorage and let other tabs know
function writeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  if (channel) {
    channel.postMessage({ key: key });
  }
}

// ---- Profile (the customer's allergies) ----

function saveProfile(profile) {
  // profile looks like: { name: "Sara", allergens: ["peanut", "okra"] }
  // savedAt lets pages tell "never saved" apart from "saved with no allergies"
  profile.savedAt = new Date().toISOString();
  writeData(PROFILE_KEY, profile);
}

function getProfile() {
  return readData(PROFILE_KEY, { name: "", allergens: [] });
}

// ---- Orders ----

function getOrders() {
  return readData(ORDERS_KEY, []);
}

// Next short order id like "#1042" (one more than the biggest so far)
function newOrderId() {
  let biggest = 1000;
  getOrders().forEach(function (o) {
    const n = parseInt(String(o.id).replace("#", ""), 10);
    if (n > biggest) biggest = n;
  });
  return "#" + (biggest + 1);
}

// Saves a new order and returns it
function placeOrder(order) {
  const orders = getOrders();
  orders.push(order);
  writeData(ORDERS_KEY, orders);
  return order;
}

// Changes some fields of an order, e.g. updateOrder(id, { status: "confirmed" })
function updateOrder(id, changes) {
  const orders = getOrders();
  const order = orders.find(function (o) { return o.id === id; });
  if (!order) return null;
  Object.assign(order, changes);
  writeData(ORDERS_KEY, orders);
  return order;
}

// Delete all SafeBite data (used by the demo's Reset button)
function resetAll() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ORDERS_KEY);
  if (channel) {
    channel.postMessage({ key: "reset" });
  }
}

// Run callback whenever another tab changes our data.
// Both the "storage" event and BroadcastChannel may fire for the same change,
// so the callback should just re-read and redraw (safe to run twice).
function onChange(callback) {
  window.addEventListener("storage", function (e) {
    if (e.key === PROFILE_KEY || e.key === ORDERS_KEY) {
      callback(e.key);
    }
  });
  if (channel) {
    channel.addEventListener("message", function (e) {
      callback(e.data.key);
    });
  }
}
