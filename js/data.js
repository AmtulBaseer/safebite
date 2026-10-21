// SafeBite - shared data (allergens + fake restaurant menu)

// Small inline SVG icons for allergens that don't have an emoji
// Soy bean pod with three beans
const SOY_SVG =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">' +
  '<g transform="rotate(-35 12 12)">' +
  '<rect x="0.5" y="6.5" width="23" height="11" rx="5.5" fill="#7CB342" stroke="#33691E" stroke-width="1.2"/>' +
  '<circle cx="6" cy="12" r="3.2" fill="#DCEDC8"/>' +
  '<circle cx="12" cy="12" r="3.2" fill="#DCEDC8"/>' +
  '<circle cx="18" cy="12" r="3.2" fill="#DCEDC8"/>' +
  '</g>' +
  '</svg>';

const SESAME_SVG =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">' +
  '<ellipse cx="7" cy="8" rx="2.5" ry="4" fill="#F5E6C8" stroke="#8E24AA" transform="rotate(-20 7 8)"/>' +
  '<ellipse cx="16" cy="7" rx="2.5" ry="4" fill="#F5E6C8" stroke="#8E24AA" transform="rotate(25 16 7)"/>' +
  '<ellipse cx="12" cy="17" rx="2.5" ry="4" fill="#F5E6C8" stroke="#8E24AA"/>' +
  '</svg>';

// The 8 allergens. "icon" is either an emoji or an SVG string.
const ALLERGENS = [
  { id: "peanut",    name: "Peanut",    color: "#E53935", icon: "🥜" },
  { id: "tree-nuts", name: "Tree Nuts", color: "#FB8C00", icon: "🌰" },
  { id: "dairy",     name: "Dairy",     color: "#1E88E5", icon: "🥛" },
  { id: "egg",       name: "Egg",       color: "#FDD835", icon: "🥚" },
  { id: "gluten",    name: "Gluten",    color: "#8D6E63", icon: "🌾" },
  { id: "soy",       name: "Soy",       color: "#43A047", icon: SOY_SVG },
  { id: "sesame",    name: "Sesame",    color: "#8E24AA", icon: SESAME_SVG },
  { id: "shellfish", name: "Shellfish", color: "#EC407A", icon: "🦐" }
];

// Find one allergen by its id
function getAllergen(id) {
  return ALLERGENS.find(function (a) { return a.id === id; });
}

// Drop allergen ids we don't have any more (e.g. old "okra" data)
function knownAllergens(ids) {
  return (ids || []).filter(function (id) { return getAllergen(id); });
}

// "avocado" -> "Avocado"
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Make typed text safe to put inside innerHTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// The 7 emirates
const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"
];

// Made-up restaurants (2 per emirate). hasStation = uses the SafeBite Allergen Station.
// Dish ids are unique across all restaurants, e.g. "r3-1".
const RESTAURANTS = [
  // ---------- Abu Dhabi ----------
  {
    id: "r1",
    name: "Al Bustan Majlis",
    emirate: "Abu Dhabi",
    cuisine: "Emirati",
    description: "Home-style Emirati cooking, slow-cooked the way grandma makes it. Famous for machboos and fresh luqaimat.",
    deliveryTime: "30–40 min",
    rating: 4.6,
    priceLevel: "$$",
    logo: "🍲",
    logoColor: "#A1887F",
    hasStation: true,
    menu: [
      { id: "r1-1", name: "Lamb Machboos", price: 58,
        description: "Spiced rice with tender slow-cooked lamb and dried lime.",
        allergens: [], ingredients: ["lamb", "basmati rice", "dried lime", "onion", "baharat spices"] },
      { id: "r1-2", name: "Bamia Lamb Stew", price: 45,
        description: "Slow-cooked lamb and okra in a tomato and garlic sauce.",
        allergens: [], ingredients: ["lamb", "okra", "tomato", "garlic"] },
      { id: "r1-3", name: "Grilled Chicken & Saffron Rice", price: 38,
        description: "Herb and mustard marinated chicken served with saffron rice.",
        allergens: [], ingredients: ["chicken", "mustard", "saffron rice", "lemon", "herbs"] },
      { id: "r1-4", name: "Chicken Harees", price: 38,
        description: "Creamy wheat and chicken porridge finished with ghee.",
        allergens: ["gluten", "dairy"], ingredients: ["wheat", "chicken", "ghee", "cinnamon"] },
      { id: "r1-5", name: "Luqaimat", price: 22,
        description: "Crispy sweet dumplings with date syrup and sesame.",
        allergens: ["gluten", "dairy", "sesame"], ingredients: ["flour", "yeast", "milk", "date syrup", "sesame seeds"] },
      { id: "r1-6", name: "Karak Chai", price: 8,
        description: "Strong spiced tea with cardamom and evaporated milk.",
        allergens: ["dairy"], ingredients: ["black tea", "evaporated milk", "cardamom", "saffron"] }
    ]
  },
  {
    id: "r2",
    name: "Sakura Tide",
    emirate: "Abu Dhabi",
    cuisine: "Japanese",
    description: "Fresh sushi rolls and warm rice bowls by the corniche. Light, clean flavours made to order.",
    deliveryTime: "35–45 min",
    rating: 4.7,
    priceLevel: "$$$",
    logo: "🍣",
    logoColor: "#E57373",
    hasStation: true,
    menu: [
      { id: "r2-1", name: "Salmon Avocado Roll", price: 48,
        description: "Salmon and creamy avocado rolled with sushi rice and sesame.",
        allergens: ["soy", "sesame"], ingredients: ["salmon", "avocado", "sushi rice", "nori", "sesame seeds", "soy sauce"] },
      { id: "r2-2", name: "Ebi Tempura Roll", price: 52,
        description: "Crunchy prawn tempura roll with a sweet soy glaze.",
        allergens: ["shellfish", "gluten", "egg", "soy"], ingredients: ["prawn", "tempura batter", "sushi rice", "nori", "soy sauce"] },
      { id: "r2-3", name: "Chicken Teriyaki Bowl", price: 46,
        description: "Grilled chicken in teriyaki sauce over steamed rice.",
        allergens: ["soy", "gluten", "sesame"], ingredients: ["chicken", "teriyaki sauce", "rice", "spring onion", "sesame seeds"] },
      { id: "r2-4", name: "Vegetable Gyoza", price: 32,
        description: "Pan-fried dumplings filled with cabbage and mushroom.",
        allergens: ["gluten", "soy", "sesame"], ingredients: ["wheat wrapper", "cabbage", "mushroom", "sesame oil", "soy sauce"] },
      { id: "r2-5", name: "Edamame with Sea Salt", price: 22,
        description: "Steamed young soy beans with flaky sea salt.",
        allergens: ["soy"], ingredients: ["edamame", "sea salt"] },
      { id: "r2-6", name: "Miso Soup", price: 18,
        description: "Classic miso broth with tofu, seaweed and spring onion.",
        allergens: ["soy"], ingredients: ["miso", "tofu", "seaweed", "spring onion"] }
    ]
  },

  // ---------- Dubai ----------
  {
    id: "r3",
    name: "Lemongrass Lane",
    emirate: "Dubai",
    cuisine: "Thai",
    description: "Bold Bangkok street food in the heart of Dubai. Satay, curries and noodles with real heat.",
    deliveryTime: "25–35 min",
    rating: 4.5,
    priceLevel: "$$",
    logo: "🌶️",
    logoColor: "#66BB6A",
    hasStation: true,
    menu: [
      { id: "r3-1", name: "Chicken Satay Skewers", price: 32,
        description: "Grilled chicken skewers with a rich peanut dipping sauce.",
        allergens: ["peanut", "sesame"], ingredients: ["chicken", "peanut sauce", "coconut milk", "sesame seeds", "lime"] },
      { id: "r3-2", name: "Prawn Pad Thai", price: 42,
        description: "Rice noodles with prawns, egg and crushed peanuts.",
        allergens: ["peanut", "shellfish", "egg"], ingredients: ["rice noodles", "prawns", "egg", "peanuts", "bean sprouts", "lime"] },
      { id: "r3-3", name: "Green Curry with Chicken", price: 44,
        description: "Creamy coconut green curry with Thai basil and bamboo shoots.",
        allergens: ["shellfish"], ingredients: ["chicken", "green curry paste", "shrimp paste", "coconut milk", "thai basil", "bamboo shoots"] },
      { id: "r3-4", name: "Som Tam Papaya Salad", price: 28,
        description: "Zingy green papaya salad with peanuts and dried shrimp.",
        allergens: ["peanut", "shellfish"], ingredients: ["green papaya", "peanuts", "dried shrimp", "lime", "chilli", "tomato"] },
      { id: "r3-5", name: "Tom Yum Soup", price: 34,
        description: "Hot and sour soup with prawns, lemongrass and lime leaves.",
        allergens: ["shellfish"], ingredients: ["prawns", "lemongrass", "galangal", "lime leaves", "chilli"] },
      { id: "r3-6", name: "Mango Sticky Rice", price: 24,
        description: "Sweet sticky rice with fresh mango and coconut cream.",
        allergens: [], ingredients: ["sticky rice", "mango", "coconut milk", "sugar"] }
    ]
  },
  {
    id: "r4",
    name: "Nonna Lucia",
    emirate: "Dubai",
    cuisine: "Italian",
    description: "Stone-baked pizza and fresh pasta made every morning. A little trattoria feel, delivered.",
    deliveryTime: "30–40 min",
    rating: 4.4,
    priceLevel: "$$",
    logo: "🍕",
    logoColor: "#C62828",
    hasStation: true,
    menu: [
      { id: "r4-1", name: "Margherita Flatbread", price: 35,
        description: "Stone-baked flatbread with tomato, mozzarella and basil.",
        allergens: ["gluten", "dairy"], ingredients: ["flatbread", "tomato", "mozzarella", "basil"] },
      { id: "r4-2", name: "Penne Arrabbiata", price: 39,
        description: "Penne in a spicy tomato and garlic sauce.",
        allergens: ["gluten"], ingredients: ["penne", "tomato", "garlic", "chilli", "olive oil"] },
      { id: "r4-3", name: "Fettuccine Alfredo", price: 45,
        description: "Fresh egg fettuccine in a creamy parmesan sauce.",
        allergens: ["gluten", "dairy", "egg"], ingredients: ["fettuccine", "cream", "parmesan", "butter", "black pepper"] },
      { id: "r4-4", name: "Pesto Gnocchi", price: 47,
        description: "Soft potato gnocchi tossed in basil and pine nut pesto.",
        allergens: ["gluten", "dairy", "tree-nuts"], ingredients: ["potato gnocchi", "basil", "pine nuts", "parmesan", "olive oil"] },
      { id: "r4-5", name: "Caprese Salad", price: 32,
        description: "Tomato, fresh mozzarella and basil with olive oil.",
        allergens: ["dairy"], ingredients: ["tomato", "mozzarella", "basil", "olive oil"] },
      { id: "r4-6", name: "Tiramisu", price: 28,
        description: "Coffee-soaked sponge layered with mascarpone cream.",
        allergens: ["gluten", "dairy", "egg"], ingredients: ["ladyfingers", "mascarpone", "egg", "coffee", "cocoa"] }
    ]
  },

  // ---------- Sharjah ----------
  {
    id: "r5",
    name: "Cedar & Olive",
    emirate: "Sharjah",
    cuisine: "Lebanese",
    description: "Lebanese grills, mezze and warm bread straight from the oven. Great for sharing.",
    deliveryTime: "20–30 min",
    rating: 4.6,
    priceLevel: "$$",
    logo: "🫒",
    logoColor: "#558B2F",
    hasStation: true,
    menu: [
      { id: "r5-1", name: "Chicken Shawarma Wrap", price: 24,
        description: "Marinated chicken, garlic sauce and pickles in thin bread.",
        allergens: ["gluten"], ingredients: ["chicken", "garlic sauce", "pickles", "flatbread"] },
      { id: "r5-2", name: "Falafel Plate", price: 26,
        description: "Crispy falafel with tahini, salad and pickles.",
        allergens: ["sesame"], ingredients: ["chickpeas", "parsley", "tahini", "pickles", "tomato"] },
      { id: "r5-3", name: "Hummus with Pine Nuts", price: 22,
        description: "Smooth hummus topped with toasted pine nuts and olive oil.",
        allergens: ["sesame", "tree-nuts"], ingredients: ["chickpeas", "tahini", "pine nuts", "lemon", "olive oil"] },
      { id: "r5-4", name: "Fattoush", price: 20,
        description: "Crunchy salad with sumac dressing and crispy pita.",
        allergens: ["gluten"], ingredients: ["lettuce", "tomato", "cucumber", "sumac", "pita crisps"] },
      { id: "r5-5", name: "Mixed Grill", price: 65,
        description: "Lamb kofta and shish tawook with grilled vegetables.",
        allergens: ["dairy"], ingredients: ["lamb kofta", "chicken", "yogurt marinade", "onion", "parsley"] },
      { id: "r5-6", name: "Pistachio Kunafa", price: 30,
        description: "Sweet cheese pastry topped with pistachios and syrup.",
        allergens: ["tree-nuts", "dairy", "gluten"], ingredients: ["kunafa pastry", "sweet cheese", "pistachios", "sugar syrup"] }
    ]
  },
  {
    id: "r6",
    name: "Masala Junction",
    emirate: "Sharjah",
    cuisine: "Indian",
    description: "North Indian curries, tandoor breads and lassi. Comfort food with plenty of spice.",
    deliveryTime: "30–45 min",
    rating: 4.5,
    priceLevel: "$",
    logo: "🍛",
    logoColor: "#FB8C00",
    hasStation: true,
    menu: [
      { id: "r6-1", name: "Butter Chicken", price: 38,
        description: "Tandoori chicken in a creamy tomato and cashew sauce.",
        allergens: ["dairy", "tree-nuts"], ingredients: ["chicken", "tomato", "cream", "butter", "cashews"] },
      { id: "r6-2", name: "Chana Masala", price: 26,
        description: "Chickpeas simmered with tomato, onion and garam masala.",
        allergens: [], ingredients: ["chickpeas", "tomato", "onion", "garam masala"] },
      { id: "r6-3", name: "Bhindi Masala", price: 24,
        description: "Stir-fried okra with onion, tomato and cumin.",
        allergens: [], ingredients: ["okra", "onion", "tomato", "cumin"] },
      { id: "r6-4", name: "Paneer Tikka", price: 34,
        description: "Chargrilled paneer cubes with peppers and mint chutney.",
        allergens: ["dairy"], ingredients: ["paneer", "yogurt", "peppers", "onion", "mint chutney"] },
      { id: "r6-5", name: "Garlic Naan", price: 8,
        description: "Soft tandoor bread brushed with garlic butter.",
        allergens: ["gluten", "dairy"], ingredients: ["flour", "garlic", "butter", "yogurt"] },
      { id: "r6-6", name: "Mango Lassi", price: 14,
        description: "Chilled yogurt drink blended with sweet mango.",
        allergens: ["dairy"], ingredients: ["yogurt", "mango", "sugar", "cardamom"] }
    ]
  },

  // ---------- Ajman ----------
  {
    id: "r7",
    name: "Stack Shack Burgers",
    emirate: "Ajman",
    cuisine: "Burgers",
    description: "Smash burgers, crispy chicken and loaded fries. Big flavours, no fuss.",
    deliveryTime: "20–30 min",
    rating: 4.3,
    priceLevel: "$$",
    logo: "🍔",
    logoColor: "#6D4C41",
    hasStation: true,
    menu: [
      { id: "r7-1", name: "Classic Smash Burger", price: 42,
        description: "Two smashed beef patties, cheese and house sauce on a sesame bun.",
        allergens: ["gluten", "dairy", "egg", "sesame"], ingredients: ["beef", "cheddar", "house sauce", "pickles", "sesame bun"] },
      { id: "r7-2", name: "Crispy Chicken Burger", price: 39,
        description: "Buttermilk fried chicken with slaw and mayo.",
        allergens: ["gluten", "egg", "dairy"], ingredients: ["chicken", "buttermilk", "flour", "coleslaw", "mayo", "brioche bun"] },
      { id: "r7-3", name: "Avocado Veggie Burger", price: 37,
        description: "Plant-based patty with smashed avocado and lettuce.",
        allergens: ["gluten", "soy", "sesame"], ingredients: ["veggie patty", "avocado", "lettuce", "tomato", "sesame bun"] },
      { id: "r7-4", name: "Loaded Fries", price: 22,
        description: "Crispy fries with melted cheese and jalapeños.",
        allergens: ["dairy"], ingredients: ["potatoes", "cheese sauce", "jalapeños", "spring onion"] },
      { id: "r7-5", name: "Grilled Chicken Salad", price: 32,
        description: "Grilled chicken on crisp greens with lemon dressing.",
        allergens: [], ingredients: ["chicken", "lettuce", "tomato", "cucumber", "lemon dressing"] },
      { id: "r7-6", name: "Chocolate Milkshake", price: 18,
        description: "Thick chocolate shake made with real ice cream.",
        allergens: ["dairy"], ingredients: ["milk", "ice cream", "chocolate"] }
    ]
  },
  {
    id: "r8",
    name: "Lahore Grill House",
    emirate: "Ajman",
    cuisine: "Pakistani",
    description: "Charcoal kebabs, karahi and biryani the Lahori way. Generous portions, late-night favourite.",
    deliveryTime: "35–50 min",
    rating: 4.4,
    priceLevel: "$",
    logo: "🔥",
    logoColor: "#2E7D32",
    hasStation: false,
    menu: [
      { id: "r8-1", name: "Chicken Biryani", price: 32,
        description: "Layered basmati rice with spiced chicken and fried onions.",
        allergens: ["dairy"], ingredients: ["basmati rice", "chicken", "yogurt", "fried onions", "saffron"] },
      { id: "r8-2", name: "Chicken Karahi", price: 45,
        description: "Wok-cooked chicken with tomato, ginger and green chilli.",
        allergens: [], ingredients: ["chicken", "tomato", "ginger", "green chilli", "coriander"] },
      { id: "r8-3", name: "Seekh Kebab", price: 30,
        description: "Minced beef kebabs grilled over charcoal.",
        allergens: [], ingredients: ["minced beef", "onion", "green chilli", "coriander"] },
      { id: "r8-4", name: "Daal Chawal", price: 20,
        description: "Yellow lentils with steamed rice and a squeeze of lemon.",
        allergens: [], ingredients: ["yellow lentils", "rice", "garlic", "cumin", "lemon"] },
      { id: "r8-5", name: "Peshawari Naan", price: 10,
        description: "Sweet naan stuffed with coconut, almonds and raisins.",
        allergens: ["gluten", "dairy", "tree-nuts"], ingredients: ["flour", "coconut", "almonds", "raisins", "butter"] },
      { id: "r8-6", name: "Kheer", price: 15,
        description: "Creamy rice pudding with cardamom and pistachios.",
        allergens: ["dairy", "tree-nuts"], ingredients: ["rice", "milk", "cardamom", "pistachios"] }
    ]
  },

  // ---------- Umm Al Quwain ----------
  {
    id: "r9",
    name: "Golden Lantern",
    emirate: "Umm Al Quwain",
    cuisine: "Chinese",
    description: "Wok-fired Chinese favourites, from kung pao to egg fried rice. Fast and fresh.",
    deliveryTime: "30–40 min",
    rating: 4.2,
    priceLevel: "$$",
    logo: "🥡",
    logoColor: "#D32F2F",
    hasStation: true,
    menu: [
      { id: "r9-1", name: "Beef & Broccoli Stir-Fry", price: 44,
        description: "Wok-fried beef and broccoli in a ginger soy sauce.",
        allergens: ["soy", "gluten"], ingredients: ["beef", "broccoli", "soy sauce", "ginger", "garlic"] },
      { id: "r9-2", name: "Kung Pao Chicken", price: 40,
        description: "Spicy chicken with roasted peanuts and dried chillies.",
        allergens: ["peanut", "soy", "gluten"], ingredients: ["chicken", "peanuts", "dried chilli", "soy sauce", "spring onion"] },
      { id: "r9-3", name: "Vegetable Spring Rolls", price: 22,
        description: "Crispy rolls with cabbage, carrot and glass noodles.",
        allergens: ["gluten", "soy"], ingredients: ["wheat wrapper", "cabbage", "carrot", "glass noodles", "soy sauce"] },
      { id: "r9-4", name: "Egg Fried Rice", price: 26,
        description: "Wok-tossed rice with egg, peas and spring onion.",
        allergens: ["egg", "soy"], ingredients: ["rice", "egg", "peas", "spring onion", "soy sauce"] },
      { id: "r9-5", name: "Sweet & Sour Prawns", price: 48,
        description: "Battered prawns in a tangy pineapple sauce.",
        allergens: ["shellfish", "gluten", "egg"], ingredients: ["prawns", "batter", "pineapple", "peppers", "vinegar"] },
      { id: "r9-6", name: "Steamed Jasmine Rice", price: 10,
        description: "Fluffy plain jasmine rice.",
        allergens: [], ingredients: ["jasmine rice"] }
    ]
  },
  {
    id: "r10",
    name: "Green Bowl Co.",
    emirate: "Umm Al Quwain",
    cuisine: "Healthy bowls",
    description: "Fresh, colourful bowls and smoothies for a lighter lunch. Built around veg, grains and good protein.",
    deliveryTime: "20–30 min",
    rating: 4.6,
    priceLevel: "$$",
    logo: "🥗",
    logoColor: "#7CB342",
    hasStation: true,
    menu: [
      { id: "r10-1", name: "Crispy Tofu Rice Bowl", price: 36,
        description: "Golden tofu, edamame, avocado and rice with a sesame-soy glaze.",
        allergens: ["soy", "sesame"], ingredients: ["tofu", "edamame", "avocado", "rice", "sesame-soy glaze"] },
      { id: "r10-2", name: "Quinoa Falafel Bowl", price: 38,
        description: "Baked falafel on quinoa with roasted veg and tahini.",
        allergens: ["sesame"], ingredients: ["quinoa", "falafel", "roasted vegetables", "tahini", "lemon"] },
      { id: "r10-3", name: "Chicken Power Bowl", price: 40,
        description: "Grilled chicken, brown rice and roasted sweet potato.",
        allergens: [], ingredients: ["chicken", "brown rice", "sweet potato", "spinach", "lemon"] },
      { id: "r10-4", name: "Greek Yogurt Parfait", price: 22,
        description: "Thick yogurt layered with granola, berries and almonds.",
        allergens: ["dairy", "tree-nuts", "gluten"], ingredients: ["greek yogurt", "granola", "berries", "almonds", "honey"] },
      { id: "r10-5", name: "Fresh Fruit Bowl", price: 18,
        description: "Mango, kiwi and strawberries with fresh mint and lime.",
        allergens: [], ingredients: ["mango", "kiwi", "strawberries", "mint", "lime"] },
      { id: "r10-6", name: "Green Smoothie", price: 18,
        description: "Spinach, banana, apple and ginger blended fresh.",
        allergens: [], ingredients: ["spinach", "banana", "apple", "ginger"] }
    ]
  },

  // ---------- Ras Al Khaimah ----------
  {
    id: "r11",
    name: "Casa Cactus",
    emirate: "Ras Al Khaimah",
    cuisine: "Mexican",
    description: "Tacos, burritos and fresh guacamole with a kick. Fiesta food for the whole family.",
    deliveryTime: "30–40 min",
    rating: 4.3,
    priceLevel: "$$",
    logo: "🌮",
    logoColor: "#F9A825",
    hasStation: true,
    menu: [
      { id: "r11-1", name: "Chicken Tacos", price: 34,
        description: "Three corn tortillas with chicken, salsa and sour cream.",
        allergens: ["dairy"], ingredients: ["corn tortillas", "chicken", "salsa", "sour cream", "coriander"] },
      { id: "r11-2", name: "Beef Burrito", price: 42,
        description: "Flour tortilla packed with beef, rice, beans and cheese.",
        allergens: ["gluten", "dairy"], ingredients: ["flour tortilla", "beef", "rice", "black beans", "cheese"] },
      { id: "r11-3", name: "Guacamole & Chips", price: 24,
        description: "Fresh avocado guacamole with crunchy corn chips.",
        allergens: [], ingredients: ["avocado", "lime", "tomato", "onion", "corn chips"] },
      { id: "r11-4", name: "Cheese Quesadilla", price: 30,
        description: "Toasted tortilla filled with melted cheese and peppers.",
        allergens: ["gluten", "dairy"], ingredients: ["flour tortilla", "cheese", "peppers", "onion"] },
      { id: "r11-5", name: "Shrimp Fajitas", price: 52,
        description: "Sizzling shrimp with peppers, onions and warm tortillas.",
        allergens: ["shellfish", "gluten"], ingredients: ["shrimp", "peppers", "onion", "flour tortillas", "lime"] },
      { id: "r11-6", name: "Churros", price: 20,
        description: "Cinnamon sugar churros with chocolate dip.",
        allergens: ["gluten", "egg", "dairy"], ingredients: ["flour", "egg", "butter", "cinnamon sugar", "chocolate sauce"] }
    ]
  },
  {
    id: "r12",
    name: "Hajar Harbour Fish Market",
    emirate: "Ras Al Khaimah",
    cuisine: "Seafood",
    description: "The catch of the day, grilled or fried by the harbour. Simple seafood done right.",
    deliveryTime: "40–55 min",
    rating: 4.5,
    priceLevel: "$$$",
    logo: "🐟",
    logoColor: "#0277BD",
    hasStation: false,
    menu: [
      { id: "r12-1", name: "Grilled Hammour", price: 75,
        description: "Local hammour grilled with lemon, garlic and herbs.",
        allergens: [], ingredients: ["hammour fish", "lemon", "garlic", "herbs"] },
      { id: "r12-2", name: "Prawn Machboos", price: 68,
        description: "Spiced Emirati rice cooked with juicy prawns.",
        allergens: ["shellfish"], ingredients: ["prawns", "basmati rice", "dried lime", "tomato", "baharat spices"] },
      { id: "r12-3", name: "Fried Calamari", price: 42,
        description: "Crispy calamari rings with lemon and garlic dip.",
        allergens: ["shellfish", "gluten"], ingredients: ["calamari", "flour", "lemon", "garlic dip"] },
      { id: "r12-4", name: "Lobster Thermidor", price: 120,
        description: "Lobster baked in a rich creamy cheese sauce.",
        allergens: ["shellfish", "dairy", "egg"], ingredients: ["lobster", "cream", "cheese", "egg yolk", "mustard"] },
      { id: "r12-5", name: "Seafood Soup", price: 36,
        description: "Creamy soup with prawns, mussels and fish.",
        allergens: ["shellfish", "dairy"], ingredients: ["prawns", "mussels", "white fish", "cream", "celery"] },
      { id: "r12-6", name: "Lemon Rice", price: 14,
        description: "Fragrant rice with lemon and turmeric.",
        allergens: [], ingredients: ["rice", "lemon", "turmeric"] }
    ]
  },

  // ---------- Fujairah ----------
  {
    id: "r13",
    name: "Seoul Spoon",
    emirate: "Fujairah",
    cuisine: "Korean",
    description: "Korean comfort food, from bibimbap to sticky fried chicken. Cosy, spicy and filling.",
    deliveryTime: "30–45 min",
    rating: 4.4,
    priceLevel: "$$",
    logo: "🍜",
    logoColor: "#5E35B1",
    hasStation: true,
    menu: [
      { id: "r13-1", name: "Bibimbap", price: 44,
        description: "Rice bowl with vegetables, beef, fried egg and gochujang.",
        allergens: ["egg", "soy", "sesame"], ingredients: ["rice", "beef", "egg", "spinach", "gochujang", "sesame oil"] },
      { id: "r13-2", name: "Korean Fried Chicken", price: 42,
        description: "Double-fried chicken in a sweet and spicy glaze.",
        allergens: ["gluten", "soy", "sesame"], ingredients: ["chicken", "flour", "gochujang", "soy sauce", "sesame seeds"] },
      { id: "r13-3", name: "Japchae", price: 36,
        description: "Glass noodles stir-fried with vegetables and sesame.",
        allergens: ["soy", "sesame"], ingredients: ["glass noodles", "spinach", "carrot", "mushroom", "soy sauce", "sesame oil"] },
      { id: "r13-4", name: "Kimchi Pancake", price: 28,
        description: "Crispy savoury pancake with spicy kimchi.",
        allergens: ["gluten", "egg", "shellfish"], ingredients: ["flour", "egg", "kimchi", "shrimp paste", "spring onion"] },
      { id: "r13-5", name: "Soft Tofu Stew", price: 38,
        description: "Bubbling spicy stew with silken tofu and egg.",
        allergens: ["soy", "egg"], ingredients: ["silken tofu", "egg", "chilli paste", "zucchini", "mushroom"] },
      { id: "r13-6", name: "Steamed Rice", price: 10,
        description: "Short-grain Korean rice.",
        allergens: [], ingredients: ["rice"] }
    ]
  },
  {
    id: "r14",
    name: "Mountain Bean Café",
    emirate: "Fujairah",
    cuisine: "Café & bakery",
    description: "Fresh bakes, smoothies and all-day breakfast with a mountain view. Perfect with your morning coffee.",
    deliveryTime: "15–25 min",
    rating: 4.7,
    priceLevel: "$",
    logo: "🥐",
    logoColor: "#8D6E63",
    hasStation: false,
    menu: [
      { id: "r14-1", name: "Avocado Toast", price: 28,
        description: "Sourdough topped with smashed avocado, chilli and lemon.",
        allergens: ["gluten"], ingredients: ["sourdough", "avocado", "chilli flakes", "lemon"] },
      { id: "r14-2", name: "Cheese & Zaatar Croissant", price: 16,
        description: "Buttery croissant with melted cheese and zaatar.",
        allergens: ["gluten", "dairy", "egg", "sesame"], ingredients: ["croissant", "cheese", "zaatar", "sesame seeds"] },
      { id: "r14-3", name: "Shakshuka", price: 30,
        description: "Eggs baked in a spiced tomato and pepper sauce.",
        allergens: ["egg"], ingredients: ["egg", "tomato", "peppers", "onion", "cumin"] },
      { id: "r14-4", name: "Peanut Butter Banana Smoothie", price: 22,
        description: "Banana, peanut butter and milk blended thick.",
        allergens: ["peanut", "dairy"], ingredients: ["banana", "peanut butter", "milk", "honey"] },
      { id: "r14-5", name: "Date & Walnut Cake", price: 18,
        description: "Moist date cake with toasted walnuts.",
        allergens: ["gluten", "egg", "dairy", "tree-nuts"], ingredients: ["flour", "dates", "walnuts", "egg", "butter"] },
      { id: "r14-6", name: "Fresh Orange Juice", price: 14,
        description: "Freshly squeezed oranges, nothing added.",
        allergens: [], ingredients: ["oranges"] }
    ]
  }
];

// Find one restaurant by its id
function getRestaurant(id) {
  return RESTAURANTS.find(function (r) { return r.id === id; });
}
