// SafeBite - Kitchen Allergen Station

const stationGrid = document.getElementById("station-grid");
const lcd = document.getElementById("lcd");
const separateSwitch = document.getElementById("separate-switch");
const separateLed = document.getElementById("separate-led");

let currentOrder = null;     // the order on screen right now
let showingConfirmed = false; // true during the 2 second "✓ Confirmed" message

// Draw the 8 buttons once (same order as ALLERGENS / the real device)
ALLERGENS.forEach(function (a) {
  const item = document.createElement("div");
  item.className = "allergen-item";
  item.innerHTML =
    '<div class="allergen-btn" data-id="' + a.id + '">' +
    '<span class="icon">' + a.icon + "</span></div>" +
    "<span>" + a.name + "</span>";
  item.firstChild.style.setProperty("--c", a.color);
  stationGrid.appendChild(item);
});

// All orders still waiting for the kitchen, oldest first
function getWaitingOrders() {
  return getOrders()
    .filter(function (o) { return o.status === "waiting"; })
    .sort(function (a, b) { return new Date(a.time) - new Date(b.time); });
}

// Update the screen and the blinking buttons
function render() {
  // Don't cover up the "✓ Confirmed" message
  if (showingConfirmed) return;

  const waiting = getWaitingOrders();
  const order = waiting[0];
  currentOrder = order || null;

  stopBlinking();

  if (!order) {
    lcd.innerHTML = 'Waiting for orders<span class="cursor">_</span>';
    return;
  }

  // Blink only the customer's allergens
  order.allergens.forEach(function (id) {
    const btn = stationGrid.querySelector('[data-id="' + id + '"]');
    if (btn) btn.classList.add("blink");
  });

  // Order number, time and dishes on the screen
  const time = new Date(order.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  let html = '<div class="order-no">ORDER ' + order.id + " · " + time + "</div>";

  order.items.forEach(function (item) {
    html += "<div>" + item.qty + "× " + item.name + "</div>";
  });

  if (order.allergens.length > 0) {
    const names = order.allergens.map(function (id) { return getAllergen(id).name; });
    html += '<div class="keep-out">⚠ KEEP OUT: ' + names.join(", ").toUpperCase() + "</div>";
  }

  // Typed allergies have no button, so they blink on the screen instead
  if (order.otherAllergies.length > 0) {
    const others = order.otherAllergies.map(capitalize).join(", ");
    html += '<div class="also-avoid">⚠ Also avoid: ' + escapeHtml(others) + "</div>";
  }

  if (order.allergens.length === 0 && order.otherAllergies.length === 0) {
    html += "<div>No allergies</div>";
  }

  if (waiting.length > 1) {
    html += "<div>+" + (waiting.length - 1) + " more waiting</div>";
  }

  lcd.innerHTML = html;
}

function stopBlinking() {
  document.querySelectorAll("#station-grid .allergen-btn").forEach(function (btn) {
    btn.classList.remove("blink");
  });
}

// Put the switch back to "No" for the next order
function resetSwitch() {
  separateSwitch.checked = false;
  separateLed.classList.remove("on");
}

// "Prepared in separate area" switch: light turns green on Yes
separateSwitch.addEventListener("change", function () {
  separateLed.classList.toggle("on", separateSwitch.checked);
});

// Confirm & Send: mark the order safe and tell the customer
document.getElementById("confirm-btn").addEventListener("click", function () {
  if (!currentOrder || showingConfirmed) return; // nothing to confirm

  updateOrder(currentOrder.id, {
    status: "confirmed",
    separateArea: separateSwitch.checked
  });

  // Show "✓ Confirmed" for 2 seconds, then move on
  showingConfirmed = true;
  stopBlinking();
  lcd.innerHTML =
    '<div class="lcd-confirmed">✓ Confirmed</div>' +
    "<div>Order " + currentOrder.id + " sent to customer</div>";

  setTimeout(function () {
    showingConfirmed = false;
    resetSwitch();
    render();
    fitToFrame();
  }, 2000);
});

// In the demo page, shrink the device so it fits the frame without scrolling
function fitToFrame() {
  if (!document.documentElement.classList.contains("embedded")) return;
  const wrap = document.querySelector(".station-wrap");
  const needed = wrap.offsetTop + wrap.offsetHeight + 16;
  const scale = Math.min(1, window.innerHeight / needed);
  wrap.style.transform = "scale(" + scale + ")";
}

// Redraw whenever a new order arrives from the customer tab
onChange(function () {
  render();
  fitToFrame(); // the screen may have grown with a long order
});
window.addEventListener("resize", fitToFrame);
render();
fitToFrame();
