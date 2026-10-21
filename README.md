# SafeBite 🛡️

A student prototype for the Innovation & Entrepreneurship course.

## The problem

People with food allergies struggle to find clear allergen information on food
delivery apps. Even when they mention an allergy in the order notes, there is no
guarantee the kitchen sees it or acts on it.

## The idea

1. The customer taps coloured allergen buttons to save their allergies once.
2. The menu warns them about dishes that contain those allergens.
3. When they order, a **Kitchen Allergen Station** in the restaurant blinks the
   buttons for the customer's allergies, so staff know exactly what to keep out.
4. Staff press **Confirm & Send** (and say whether the food was prepared in a
   separate area), and the customer gets a confirmation on their phone.

The 8 allergens: Peanut, Tree Nuts, Dairy, Egg, Gluten, Okra, Sesame, Shellfish.

## How to use the demo

1. Open **demo.html**. It shows the customer's phone on the left and the kitchen station on the right.
2. On the phone, tap your allergies and press **Save my allergies**.
3. Add a few dishes (dishes with your allergens show a red warning), open the cart and press **Place order**.
4. On the station, the buttons for your allergies start blinking and the screen shows the order.
5. Optionally flip **Prepared in separate area** to Yes, then press **Confirm & Send**.
6. The phone shows that the kitchen has confirmed your order.

Press **Reset demo** at the top to clear everything and start again.

You can also open `customer.html` and `station.html` in two separate tabs or windows of the same browser. They update each other live.

## About the station page

`station.html` is an on-screen version of a **physical prototype**: a small
wedge-shaped device that sits in the restaurant kitchen, with 8 light-up
allergen buttons, a small screen, a Confirm & Send button and a "Prepared in
separate area" switch. In this web version the device is drawn with HTML and CSS.

## How it works

- Plain HTML, CSS and JavaScript. No frameworks or build tools.
- Data is saved in the browser's `localStorage` (`js/store.js`). Open tabs are
  kept in sync with the `storage` event and `BroadcastChannel`.
- The menu and allergens are in `js/data.js`. The restaurant "Spice Souk Kitchen" is made up.
- There is no real server, so the customer and the station only see each other
  when they're open in the same browser.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home page |
| `customer.html` | Customer app: allergies, menu, cart, order status |
| `station.html` | Kitchen Allergen Station |
| `demo.html` | Both side by side, for presenting |
| `css/style.css` | All styles |
| `js/data.js` | Allergens and menu |
| `js/store.js` | Saving data and syncing tabs |
| `js/customer.js`, `js/station.js` | Page logic |
