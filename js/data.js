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

// Our made-up restaurant
const RESTAURANT = {
  name: "Spice Souk Kitchen",
  location: "Dubai Marina",
  menu: [
    {
      id: "d1",
      name: "Chicken Satay Skewers",
      description: "Grilled chicken skewers with a rich peanut dipping sauce.",
      price: 32,
      allergens: ["peanut", "sesame"]
    },
    {
      id: "d2",
      name: "Beef & Broccoli Stir-Fry",
      description: "Wok-fried beef and broccoli in a ginger soy sauce.",
      price: 44,
      allergens: ["soy", "gluten"]
    },
    {
      id: "d3",
      name: "Prawn Pad Thai",
      description: "Rice noodles with prawns, egg and crushed peanuts.",
      price: 42,
      allergens: ["peanut", "shellfish", "egg"]
    },
    {
      id: "d4",
      name: "Margherita Flatbread",
      description: "Stone-baked flatbread with tomato, mozzarella and basil.",
      price: 35,
      allergens: ["gluten", "dairy"]
    },
    {
      id: "d5",
      name: "Crispy Tofu Rice Bowl",
      description: "Golden tofu, edamame and rice with a sesame-soy glaze.",
      price: 36,
      allergens: ["soy", "sesame"]
    },
    {
      id: "d6",
      name: "Grilled Chicken & Saffron Rice",
      description: "Herb-marinated chicken breast served with saffron rice.",
      price: 38,
      allergens: []
    },
    {
      id: "d7",
      name: "Pistachio Kunafa",
      description: "Sweet cheese pastry topped with pistachios and syrup.",
      price: 30,
      allergens: ["tree-nuts", "dairy", "gluten"]
    },
    {
      id: "d8",
      name: "Fresh Fruit Bowl",
      description: "Seasonal fruit with fresh mint and a squeeze of lime.",
      price: 18,
      allergens: []
    }
  ]
};
