// SafeBite - customer page

let selected = [];        // allergen ids the customer has tapped
let otherSelected = [];   // typed allergies like "avocado"
let cart = [];            // items like { dishId: "d1", qty: 2 }
let currentScreen = "";
let lastOrderId = null;   // the order shown on the status screen

const grid = document.getElementById("allergen-grid");
const countText = document.getElementById("selected-count");
const myAllergies = document.getElementById("my-allergies");
const myChips = document.getElementById("my-chips");
const menuList = document.getElementById("menu-list");
const cartBar = document.getElementById("cart-bar");
const otherInput = document.getElementById("other-input");

// The restaurant whose menu is open. customer.html?restaurant=r3 opens one directly.
const params = new URLSearchParams(window.location.search);
let currentRestaurant = getRestaurant(params.get("restaurant")) || RESTAURANTS[0];
let sortBy = "safe";      // restaurant list order: "safe" or "rating"
let cartRestaurant = null; // the restaurant the cart's dishes come from
let onlySafe = false;     // menu toggle: hide dishes with my allergens

// ---------- Small helpers ----------

function formatPrice(amount) {
  return "AED " + amount.toFixed(2);
}

// Find a dish by id in any restaurant (the cart may be from another one)
function getDish(id) {
  let found = null;
  RESTAURANTS.forEach(function (r) {
    r.menu.forEach(function (d) {
      if (d.id === id) found = d;
    });
  });
  return found;
}

// "peanut", "soy" -> ["Peanut", "Soy"]
function allergenNames(ids) {
  return ids.map(function (id) { return getAllergen(id).name; });
}

// Fill a box with coloured allergen chips, plus grey chips for other allergies
function makeChips(container, ids, emptyText, others) {
  others = others || [];
  container.innerHTML = "";

  if (ids.length === 0 && others.length === 0) {
    container.innerHTML = '<span class="no-allergens">' + emptyText + "</span>";
    return;
  }

  ids.forEach(function (id) {
    const a = getAllergen(id);
    if (!a) return;
    const chip = document.createElement("span");
    chip.className = "tag " + a.id;
    chip.style.background = a.color;
    chip.textContent = a.name;
    container.appendChild(chip);
  });

  others.forEach(function (name) {
    const chip = document.createElement("span");
    chip.className = "tag other";
    chip.textContent = capitalize(name);
    container.appendChild(chip);
  });
}

// Which of my other allergies are in this dish? (case-insensitive,
// "peanut" also matches "peanut sauce")
function otherAllergiesIn(dish, others) {
  return others.filter(function (allergy) {
    return dish.ingredients.some(function (ing) {
      return ing.toLowerCase().includes(allergy.toLowerCase());
    });
  });
}

// Names of everything in this dish the customer is allergic to (empty = safe)
function dishWarnings(dish, profile) {
  const main = dish.allergens.filter(function (id) {
    return profile.allergens.includes(id);
  });
  const other = otherAllergiesIn(dish, profile.otherAllergies);
  return allergenNames(main).concat(other.map(capitalize));
}

// ---------- Screen 1: allergy profile ----------

// Draw the 8 allergen buttons
function drawGrid() {
  grid.innerHTML = "";

  ALLERGENS.forEach(function (a) {
    const item = document.createElement("div");
    item.className = "allergen-item";

    const btn = document.createElement("button");
    btn.className = "allergen-btn";
    btn.style.setProperty("--c", a.color);
    btn.setAttribute("aria-label", a.name);
    btn.innerHTML = '<span class="icon">' + a.icon + "</span>";
    setButtonState(btn, selected.includes(a.id));

    // Tap = toggle this allergen on/off
    btn.addEventListener("click", function () {
      if (selected.includes(a.id)) {
        selected = selected.filter(function (id) { return id !== a.id; });
      } else {
        selected.push(a.id);
      }
      setButtonState(btn, selected.includes(a.id));
      updateCount();
    });

    const label = document.createElement("span");
    label.textContent = a.name;

    item.appendChild(btn);
    item.appendChild(label);
    grid.appendChild(item);
  });

  updateCount();
  drawOtherChips();
}

function setButtonState(btn, isOn) {
  btn.classList.toggle("selected", isOn);
  btn.setAttribute("aria-pressed", isOn);
}

function updateCount() {
  if (selected.length === 0) {
    countText.textContent = "Nothing selected yet.";
  } else {
    countText.textContent = selected.length + " selected";
  }
}

// Grey chips with an × for the typed allergies
function drawOtherChips() {
  const box = document.getElementById("other-chips");
  box.innerHTML = "";

  otherSelected.forEach(function (name) {
    const chip = document.createElement("span");
    chip.className = "tag other";
    chip.textContent = capitalize(name) + " ";

    const remove = document.createElement("button");
    remove.className = "chip-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove " + name);
    remove.addEventListener("click", function () {
      otherSelected = otherSelected.filter(function (n) { return n !== name; });
      drawOtherChips();
    });

    chip.appendChild(remove);
    box.appendChild(chip);
  });
}

// Add button (or Enter). "kiwi, mustard" adds both.
document.getElementById("other-form").addEventListener("submit", function (e) {
  e.preventDefault();

  otherInput.value.split(",").forEach(function (text) {
    const name = text.trim().toLowerCase();
    if (name !== "" && !otherSelected.includes(name)) {
      otherSelected.push(name);
    }
  });

  otherInput.value = "";
  drawOtherChips();
});

// ---------- Screen 2: restaurant list ----------

// Small badge or grey note about the Allergen Station
function stationHtml(restaurant) {
  if (restaurant.hasStation) {
    return '<span class="station-badge">🛡 Allergen Station</span>';
  }
  return '<p class="no-station">No allergen station. Allergy info may be limited</p>';
}

// "✓ 4 of 6 dishes safe for you" (green) or "⚠ Only 1 safe dish" (orange)
function safetySummary(restaurant, profile) {
  const total = restaurant.menu.length;
  const safe = restaurant.menu.filter(function (dish) {
    return dishWarnings(dish, profile).length === 0;
  }).length;

  if (safe === total) {
    return { safe: safe, cls: "safe-good", text: "✓ All " + total + " dishes safe for you" };
  }
  if (safe >= total / 2) {
    return { safe: safe, cls: "safe-good", text: "✓ " + safe + " of " + total + " dishes safe for you" };
  }
  if (safe === 0) {
    return { safe: safe, cls: "safe-none", text: "⚠ No safe dishes for you" };
  }
  return { safe: safe, cls: "safe-few", text: "⚠ Only " + safe + " safe dish" + (safe === 1 ? "" : "es") };
}

// Row of emirate chips at the top
function drawEmirateChips() {
  const box = document.getElementById("emirate-chips");
  box.innerHTML = "";

  EMIRATES.forEach(function (emirate) {
    const chip = document.createElement("button");
    chip.className = "emirate-chip" + (emirate === getEmirate() ? " active" : "");
    chip.textContent = emirate;
    chip.addEventListener("click", function () {
      saveEmirate(emirate);
      drawEmirateChips();
      drawRestaurantList();
    });
    box.appendChild(chip);
  });
}

function drawRestaurantList() {
  const profile = getProfile();
  const list = document.getElementById("restaurant-list");
  list.innerHTML = "";

  // Only this emirate, with the allergy summary worked out for each
  const restaurants = RESTAURANTS
    .filter(function (r) { return r.emirate === getEmirate(); })
    .map(function (r) { return { r: r, summary: safetySummary(r, profile) }; });

  restaurants.sort(function (a, b) {
    if (sortBy === "safe" && b.summary.safe !== a.summary.safe) {
      return b.summary.safe - a.summary.safe;
    }
    return b.r.rating - a.r.rating;
  });

  document.getElementById("restaurant-count").textContent =
    restaurants.length + " restaurants in " + getEmirate();

  restaurants.forEach(function (item) {
    const r = item.r;
    const card = document.createElement("a");
    card.href = "#";
    card.className = "card restaurant-card";
    card.innerHTML =
      '<span class="logo" style="background:' + r.logoColor + '">' + r.logo + "</span>" +
      '<div class="info">' +
        '<div class="restaurant-top"><h3>' + r.name + "</h3>" +
        '<span class="rating">★ ' + r.rating.toFixed(1) + "</span></div>" +
        '<p class="meta">' + r.cuisine + " · " + r.deliveryTime + " · " + r.priceLevel + "</p>" +
        '<p class="desc">' + r.description + "</p>" +
        '<p class="safety ' + item.summary.cls + '">' + item.summary.text + "</p>" +
        stationHtml(r) +
      "</div>";

    card.addEventListener("click", function (e) {
      e.preventDefault();
      openRestaurant(r);
    });
    list.appendChild(card);
  });
}

// Open a restaurant's page
function openRestaurant(restaurant) {
  currentRestaurant = restaurant;
  showScreen("menu");
}

// ---------- Screen 3: restaurant page ----------

function drawRestaurantHeader() {
  const r = currentRestaurant;
  document.getElementById("restaurant-header").innerHTML =
    '<div class="restaurant-header">' +
      '<span class="logo" style="background:' + r.logoColor + '">' + r.logo + "</span>" +
      "<div>" +
        "<h2>" + r.name + "</h2>" +
        '<p class="meta">' + r.cuisine + ' · <span class="rating">★ ' + r.rating.toFixed(1) + "</span></p>" +
        '<p class="meta">' + r.deliveryTime + " · " + r.emirate + " · " + r.priceLevel + "</p>" +
      "</div>" +
    "</div>" +
    '<p class="restaurant-desc">' + r.description + "</p>" +
    stationHtml(r);
}

function drawMenu() {
  const profile = getProfile();
  menuList.innerHTML = "";
  drawRestaurantHeader();

  // Toggle buttons
  document.getElementById("show-all-btn").classList.toggle("active", !onlySafe);
  document.getElementById("only-safe-btn").classList.toggle("active", onlySafe);

  currentRestaurant.menu.forEach(function (dish) {
    const warningNames = dishWarnings(dish, profile);
    const hasWarning = warningNames.length > 0;
    if (onlySafe && hasWarning) return; // hide it

    const card = document.createElement("div");
    card.className = "card dish" + (hasWarning ? " warn" : "");

    let html =
      '<div class="dish-top"><h3>' + dish.name + "</h3>" +
      '<span class="price">' + formatPrice(dish.price) + "</span></div>" +
      '<p class="muted">' + dish.description + "</p>" +
      '<p class="ingredients">Ingredients: ' + dish.ingredients.join(", ") + "</p>";

    if (hasWarning) {
      html += '<p class="warning">⚠ Contains ' + escapeHtml(warningNames.join(", ")) +
              " (you're allergic)</p>";
    }

    html += '<div class="dish-bottom"><div class="chips"></div>' +
            '<button class="btn btn-small">Add</button></div>';
    card.innerHTML = html;

    makeChips(card.querySelector(".chips"), dish.allergens, "No common allergens");

    const addBtn = card.querySelector("button");
    addBtn.addEventListener("click", function () {
      addToCart(dish, hasWarning, addBtn);
    });

    menuList.appendChild(card);
  });

  if (menuList.children.length === 0) {
    menuList.innerHTML = '<p class="muted">No dishes here are safe for your allergies.</p>';
  }
}

function addToCart(dish, hasWarning, btn) {
  if (hasWarning && !confirm("This dish contains an allergen you selected. Add anyway?")) {
    return;
  }

  // The cart can only hold dishes from one restaurant
  if (cart.length > 0 && cartRestaurant.id !== currentRestaurant.id) {
    if (!confirm("Your cart has dishes from " + cartRestaurant.name + ". Start a new cart?")) {
      return;
    }
    cart = [];
  }
  cartRestaurant = currentRestaurant;

  const item = cart.find(function (i) { return i.dishId === dish.id; });
  if (item) {
    item.qty++;
  } else {
    cart.push({ dishId: dish.id, qty: 1 });
  }

  // Quick feedback on the button
  btn.textContent = "Added ✓";
  setTimeout(function () { btn.textContent = "Add"; }, 800);

  updateCartBar();
}

// ---------- Cart ----------

function cartCount() {
  return cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
}

function cartTotal() {
  return cart.reduce(function (sum, i) { return sum + getDish(i.dishId).price * i.qty; }, 0);
}

// Bottom bar: only on the menu screen, only when something is in the cart
function updateCartBar() {
  const count = cartCount();
  cartBar.classList.toggle("hidden", count === 0 || currentScreen !== "menu");
  document.getElementById("cart-bar-text").textContent =
    "🛒 " + count + (count === 1 ? " item" : " items") + " · " + formatPrice(cartTotal());
}

function drawCart() {
  const list = document.getElementById("cart-list");
  list.innerHTML = "";

  if (cart.length === 0) {
    list.innerHTML = '<p class="muted">Your cart is empty.</p>';
  }

  cart.forEach(function (item) {
    const dish = getDish(item.dishId);
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML =
      '<button class="qty-btn" aria-label="Remove one">−</button>' +
      "<span>" + item.qty + "×</span>" +
      '<span class="name">' + dish.name + "</span>" +
      "<span>" + formatPrice(dish.price * item.qty) + "</span>";

    // Remove one of this dish
    row.querySelector("button").addEventListener("click", function () {
      item.qty--;
      if (item.qty === 0) {
        cart = cart.filter(function (i) { return i !== item; });
      }
      drawCart();
    });

    list.appendChild(row);
  });

  document.getElementById("cart-total").textContent = formatPrice(cartTotal());
  document.getElementById("cart-restaurant").textContent =
    cart.length > 0 ? "From " + cartRestaurant.name : "";

  // Remind the customer what the kitchen will see
  const profile = getProfile();
  const hasAny = profile.allergens.length > 0 || profile.otherAllergies.length > 0;
  const hasStation = cart.length === 0 || cartRestaurant.hasStation;
  makeChips(document.getElementById("cart-chips"), profile.allergens,
            "No allergies selected", profile.otherAllergies);

  let alertText = "You haven't told us about any allergies.";
  if (hasAny && hasStation) alertText = "The kitchen will be alerted about these allergies";
  if (hasAny && !hasStation) alertText = "Your allergies are saved with the order";
  document.getElementById("cart-alert-text").textContent = alertText;

  // Warn before ordering from a restaurant without a station
  document.getElementById("no-station-warning").classList.toggle("hidden", hasStation);

  document.getElementById("place-btn").disabled = cart.length === 0;
}

// ---------- Placing the order ----------

function sendOrder() {
  const profile = getProfile();
  const order = placeOrder({
    id: newOrderId(),
    restaurantId: cartRestaurant.id,
    restaurantName: cartRestaurant.name,
    items: cart.map(function (i) {
      const dish = getDish(i.dishId);
      return { dishId: dish.id, name: dish.name, price: dish.price, qty: i.qty };
    }),
    allergens: profile.allergens.slice(),
    otherAllergies: profile.otherAllergies.slice(),
    // No station = the kitchen gets no live alert, so station.html ignores it
    status: cartRestaurant.hasStation ? "waiting" : "no-station",
    separateArea: null,
    time: new Date().toISOString()
  });

  cart = [];
  currentRestaurant = cartRestaurant; // "Back to menu" goes to where they ordered
  lastOrderId = order.id;
  // Remember it for this tab, so a page refresh doesn't lose the order
  sessionStorage.setItem("safebite_last_order", order.id);
  showScreen("status");
}

// ---------- Screen 5: order status ----------

function drawStatus() {
  const order = getOrders().find(function (o) { return o.id === lastOrderId; });
  const box = document.getElementById("status-box");
  if (!order) return;

  document.getElementById("status-title").textContent = "Order " + order.id;
  const hasAny = order.allergens.length > 0 || order.otherAllergies.length > 0;
  const from = order.restaurantName ? '<p class="muted">From ' + order.restaurantName + "</p>" : "";

  if (order.status === "no-station") {
    box.innerHTML =
      '<div class="card status-nostation">' +
      "<p><strong>Order placed</strong></p>" + from +
      "<p>This restaurant doesn't use the Allergen Station, so the kitchen won't receive a live alert. " +
      "Please call the restaurant to double-check your allergies.</p>" +
      '<p class="muted">Your allergies:</p>' +
      '<div class="chips"></div>' +
      "</div>";
  } else if (order.status === "confirmed") {
    const area = order.separateArea ? "Yes" : "No (shared kitchen area)";
    const title = hasAny
      ? "✓ Kitchen confirmed your order is safe for:"
      : "✓ Kitchen confirmed your order";
    box.innerHTML =
      '<div class="card status-ok">' +
      '<p class="ok-title">' + title + "</p>" +
      '<div class="chips"></div>' + from +
      "<p>Prepared in a separate area: <strong>" + area + "</strong></p>" +
      "</div>";
  } else {
    box.innerHTML =
      '<div class="card status-waiting">' +
      '<div class="loader"><span></span><span></span><span></span></div>' +
      "<p><strong>Waiting for the kitchen to check your allergies…</strong></p>" + from +
      '<p class="muted">Allergies sent to the kitchen:</p>' +
      '<div class="chips"></div>' +
      "</div>";
  }

  makeChips(box.querySelector(".chips"), order.allergens, "No allergies selected", order.otherAllergies);
}

// ---------- Switching screens ----------

function showScreen(name) {
  currentScreen = name;
  ["profile", "restaurants", "menu", "cart", "status"].forEach(function (s) {
    document.getElementById(s + "-screen").classList.toggle("hidden", s !== name);
  });

  // "Your allergies" chips on the restaurant list and the menu
  const showChips = name === "restaurants" || name === "menu";
  myAllergies.classList.toggle("hidden", !showChips);
  if (showChips) {
    const profile = getProfile();
    makeChips(myChips, profile.allergens, "None", profile.otherAllergies);
  }

  if (name === "restaurants") {
    drawEmirateChips();
    drawRestaurantList();
  }
  if (name === "menu") drawMenu();
  if (name === "cart") drawCart();
  if (name === "status") drawStatus();

  updateCartBar();
  window.scrollTo(0, 0);
}

// ---------- Buttons ----------

document.getElementById("save-btn").addEventListener("click", function () {
  saveProfile({ allergens: selected.slice(), otherAllergies: otherSelected.slice() });
  showScreen("restaurants");
});

// Edit link: go back to the grid with the saved choices ticked
document.getElementById("edit-link").addEventListener("click", function (e) {
  e.preventDefault();
  const profile = getProfile();
  selected = profile.allergens.slice();
  otherSelected = profile.otherAllergies.slice();
  drawGrid();
  showScreen("profile");
});

cartBar.addEventListener("click", function () { showScreen("cart"); });

document.getElementById("back-to-list").addEventListener("click", function (e) {
  e.preventDefault();
  showScreen("restaurants");
});

document.getElementById("show-all-btn").addEventListener("click", function () {
  onlySafe = false;
  drawMenu();
});

document.getElementById("only-safe-btn").addEventListener("click", function () {
  onlySafe = true;
  drawMenu();
});

document.getElementById("sort-select").addEventListener("change", function () {
  sortBy = this.value;
  drawRestaurantList();
});

document.getElementById("back-to-menu").addEventListener("click", function (e) {
  e.preventDefault();
  showScreen("menu");
});

document.getElementById("place-btn").addEventListener("click", sendOrder);
document.getElementById("new-order-btn").addEventListener("click", function () {
  sessionStorage.removeItem("safebite_last_order");
  showScreen("menu");
});

// Listen for changes from other tabs
onChange(function (key) {
  // Profile changed: redraw the warnings and safety summaries
  if (key === "safebite_profile" && (currentScreen === "menu" || currentScreen === "restaurants")) {
    showScreen(currentScreen);
  }
  // Order changed (e.g. kitchen confirmed it): update the status screen
  if (key === "safebite_orders" && currentScreen === "status") drawStatus();
});

// ---------- Start ----------

const saved = getProfile();
selected = saved.allergens.slice();
otherSelected = saved.otherAllergies.slice();
drawGrid();

lastOrderId = sessionStorage.getItem("safebite_last_order");
const lastOrder = getOrders().find(function (o) { return o.id === lastOrderId; });

if (saved.savedAt && lastOrder) {
  // Page was refreshed after ordering: show that order's status again
  currentRestaurant = getRestaurant(lastOrder.restaurantId) || currentRestaurant;
  showScreen("status");
} else if (saved.savedAt && params.get("restaurant")) {
  // Link straight to one restaurant
  showScreen("menu");
} else if (saved.savedAt) {
  // Already has a profile: show the restaurant list
  showScreen("restaurants");
} else {
  showScreen("profile");
}
