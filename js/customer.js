// SafeBite - customer page

let selected = [];        // allergen ids the customer has tapped
let cart = [];            // items like { dishId: "d1", qty: 2 }
let currentScreen = "";
let lastOrderId = null;   // the order shown on the status screen

const grid = document.getElementById("allergen-grid");
const countText = document.getElementById("selected-count");
const myAllergies = document.getElementById("my-allergies");
const myChips = document.getElementById("my-chips");
const menuList = document.getElementById("menu-list");
const cartBar = document.getElementById("cart-bar");

// ---------- Small helpers ----------

function formatPrice(amount) {
  return "AED " + amount.toFixed(2);
}

function getDish(id) {
  return RESTAURANT.menu.find(function (d) { return d.id === id; });
}

// "peanut", "soy" -> "Peanut, Soy"
function allergenNames(ids) {
  return ids.map(function (id) { return getAllergen(id).name; }).join(", ");
}

// Fill a box with coloured allergen chips
function makeChips(container, ids, emptyText) {
  container.innerHTML = "";

  if (ids.length === 0) {
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

// ---------- Screen 2: menu ----------

function drawMenu() {
  const myAllergens = getProfile().allergens;
  menuList.innerHTML = "";

  RESTAURANT.menu.forEach(function (dish) {
    // Allergens in this dish that the customer is allergic to
    const danger = dish.allergens.filter(function (id) {
      return myAllergens.includes(id);
    });

    const card = document.createElement("div");
    card.className = "card dish" + (danger.length > 0 ? " warn" : "");

    let html =
      '<div class="dish-top"><h3>' + dish.name + "</h3>" +
      '<span class="price">' + formatPrice(dish.price) + "</span></div>" +
      '<p class="muted">' + dish.description + "</p>";

    if (danger.length > 0) {
      html += '<p class="warning">⚠ Contains ' + allergenNames(danger) + " — you're allergic</p>";
    }

    html += '<div class="dish-bottom"><div class="chips"></div>' +
            '<button class="btn btn-small">Add</button></div>';
    card.innerHTML = html;

    makeChips(card.querySelector(".chips"), dish.allergens, "No common allergens");

    const addBtn = card.querySelector("button");
    addBtn.addEventListener("click", function () {
      addToCart(dish, danger.length > 0, addBtn);
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
  const myAllergens = getProfile().allergens;
  makeChips(document.getElementById("cart-chips"), myAllergens, "No allergies selected");
  document.getElementById("cart-alert-text").textContent = myAllergens.length > 0
    ? "The kitchen will be alerted about these allergies"
    : "You haven't told us about any allergies.";

  document.getElementById("place-btn").disabled = cart.length === 0;
}

// ---------- Placing the order ----------

function sendOrder() {
  const order = placeOrder({
    id: newOrderId(),
    items: cart.map(function (i) {
      const dish = getDish(i.dishId);
      return { dishId: dish.id, name: dish.name, price: dish.price, qty: i.qty };
    }),
    allergens: getProfile().allergens.slice(),
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

  if (order.status === "confirmed") {
    const area = order.separateArea ? "Yes" : "No — shared kitchen area";
    const title = order.allergens.length > 0
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

  makeChips(box.querySelector(".chips"), order.allergens, "");
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
    makeChips(myChips, getProfile().allergens, "None");
    drawMenu();
  }
  if (name === "cart") drawCart();
  if (name === "status") drawStatus();

  updateCartBar();
  window.scrollTo(0, 0);
}

// ---------- Buttons ----------

document.getElementById("save-btn").addEventListener("click", function () {
  saveProfile({ allergens: selected.slice() });
  showScreen("menu");
});

// Edit link: go back to the grid with the saved choices ticked
document.getElementById("edit-link").addEventListener("click", function (e) {
  e.preventDefault();
  selected = getProfile().allergens.slice();
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
lastOrderId = sessionStorage.getItem("safebite_last_order");
const lastOrder = getOrders().find(function (o) { return o.id === lastOrderId; });

if (saved.savedAt && lastOrder) {
  // Page was refreshed after ordering: show that order's status again
  selected = saved.allergens.slice();
  drawGrid();
  showScreen("status");
} else if (saved.savedAt) {
  // Already has a profile: skip straight to the menu
  selected = saved.allergens.slice();
  drawGrid();
  showScreen("menu");
} else {
  drawGrid();
  showScreen("profile");
}
