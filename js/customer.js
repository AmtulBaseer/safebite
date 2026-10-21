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

// ---------- Small helpers ----------

function formatPrice(amount) {
  return "AED " + amount.toFixed(2);
}

function getDish(id) {
  return RESTAURANT.menu.find(function (d) { return d.id === id; });
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

// ---------- Screen 2: menu ----------

function drawMenu() {
  const profile = getProfile();
  menuList.innerHTML = "";

  RESTAURANT.menu.forEach(function (dish) {
    // Allergens in this dish that the customer is allergic to
    const danger = dish.allergens.filter(function (id) {
      return profile.allergens.includes(id);
    });
    const otherDanger = otherAllergiesIn(dish, profile.otherAllergies);

    const warningNames = allergenNames(danger).concat(otherDanger.map(capitalize));
    const hasWarning = warningNames.length > 0;

    const card = document.createElement("div");
    card.className = "card dish" + (hasWarning ? " warn" : "");

    let html =
      '<div class="dish-top"><h3>' + dish.name + "</h3>" +
      '<span class="price">' + formatPrice(dish.price) + "</span></div>" +
      '<p class="muted">' + dish.description + "</p>" +
      '<p class="ingredients">Ingredients: ' + dish.ingredients.join(", ") + "</p>";

    if (hasWarning) {
      html += '<p class="warning">⚠ Contains ' + escapeHtml(warningNames.join(", ")) +
              " — you're allergic</p>";
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
}

function addToCart(dish, hasWarning, btn) {
  if (hasWarning && !confirm("This dish contains an allergen you selected. Add anyway?")) {
    return;
  }

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

  // Remind the customer what the kitchen will see
  const profile = getProfile();
  const hasAny = profile.allergens.length > 0 || profile.otherAllergies.length > 0;
  makeChips(document.getElementById("cart-chips"), profile.allergens,
            "No allergies selected", profile.otherAllergies);
  document.getElementById("cart-alert-text").textContent = hasAny
    ? "The kitchen will be alerted about these allergies"
    : "You haven't told us about any allergies.";

  document.getElementById("place-btn").disabled = cart.length === 0;
}

// ---------- Placing the order ----------

function sendOrder() {
  const profile = getProfile();
  const order = placeOrder({
    id: newOrderId(),
    items: cart.map(function (i) {
      const dish = getDish(i.dishId);
      return { dishId: dish.id, name: dish.name, price: dish.price, qty: i.qty };
    }),
    allergens: profile.allergens.slice(),
    otherAllergies: profile.otherAllergies.slice(),
    status: "waiting",
    separateArea: null,
    time: new Date().toISOString()
  });

  cart = [];
  lastOrderId = order.id;
  // Remember it for this tab, so a page refresh doesn't lose the order
  sessionStorage.setItem("safebite_last_order", order.id);
  showScreen("status");
}

// ---------- Screen 4: order status ----------

function drawStatus() {
  const order = getOrders().find(function (o) { return o.id === lastOrderId; });
  const box = document.getElementById("status-box");
  if (!order) return;

  document.getElementById("status-title").textContent = "Order " + order.id;
  const hasAny = order.allergens.length > 0 || order.otherAllergies.length > 0;

  if (order.status === "confirmed") {
    const area = order.separateArea ? "Yes" : "No — shared kitchen area";
    const title = hasAny
      ? "✓ Kitchen confirmed your order is safe for:"
      : "✓ Kitchen confirmed your order";
    box.innerHTML =
      '<div class="card status-ok">' +
      '<p class="ok-title">' + title + "</p>" +
      '<div class="chips"></div>' +
      "<p>Prepared in a separate area: <strong>" + area + "</strong></p>" +
      "</div>";
  } else {
    box.innerHTML =
      '<div class="card status-waiting">' +
      '<div class="loader"><span></span><span></span><span></span></div>' +
      "<p><strong>Waiting for the kitchen to check your allergies…</strong></p>" +
      '<p class="muted">Allergies sent to the kitchen:</p>' +
      '<div class="chips"></div>' +
      "</div>";
  }

  makeChips(box.querySelector(".chips"), order.allergens, "No allergies selected", order.otherAllergies);
}

// ---------- Switching screens ----------

function showScreen(name) {
  currentScreen = name;
  ["profile", "menu", "cart", "status"].forEach(function (s) {
    document.getElementById(s + "-screen").classList.toggle("hidden", s !== name);
  });

  // Chips row only on the menu
  myAllergies.classList.toggle("hidden", name !== "menu");

  if (name === "menu") {
    const profile = getProfile();
    makeChips(myChips, profile.allergens, "None", profile.otherAllergies);
    drawMenu();
  }
  if (name === "cart") drawCart();
  if (name === "status") drawStatus();

  updateCartBar();
  window.scrollTo(0, 0);
}

// ---------- Buttons ----------

document.getElementById("save-btn").addEventListener("click", function () {
  saveProfile({ allergens: selected.slice(), otherAllergies: otherSelected.slice() });
  showScreen("menu");
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
  // Profile changed: redraw the menu warnings
  if (key === "safebite_profile" && currentScreen === "menu") showScreen("menu");
  // Order changed (e.g. kitchen confirmed it): update the status screen
  if (key === "safebite_orders" && currentScreen === "status") drawStatus();
});

// ---------- Start ----------

document.getElementById("restaurant-name").textContent = RESTAURANT.name;
document.getElementById("restaurant-location").textContent = RESTAURANT.location;

const saved = getProfile();
selected = saved.allergens.slice();
otherSelected = saved.otherAllergies.slice();
drawGrid();

lastOrderId = sessionStorage.getItem("safebite_last_order");
const lastOrder = getOrders().find(function (o) { return o.id === lastOrderId; });

if (saved.savedAt && lastOrder) {
  // Page was refreshed after ordering: show that order's status again
  showScreen("status");
} else if (saved.savedAt) {
  // Already has a profile: skip straight to the menu
  showScreen("menu");
} else {
  showScreen("profile");
}
