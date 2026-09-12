export const MOCK_RESTAURANTS = [
  {
    id: "rest-1",
    name: "Artisan Wood-Fired Pizza Co.",
    tagline: "Slow-fermented Neapolitan dough & organic San Marzano tomatoes",
    cuisine: ["Italian", "Pizza", "Pastas"],
    rating: 4.8,
    reviewCount: 420,
    deliveryTimeMinutes: "25-35",
    deliveryFee: 1.99,
    minOrder: 15.00,
    priceRange: "$$",
    bannerImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=200&q=80",
    address: "412 Columbus Ave, North Beach",
    isPromoted: true,
    discountText: "20% OFF over $30",
    categories: ["Popular", "Pizzas", "Pastas", "Salads", "Desserts", "Beverages"],
    menu: [
      {
        id: "pizza-1",
        name: "Classic Margherita DOP",
        description: "San Marzano tomatoes, buffalo mozzarella, fresh basil, and extra virgin olive oil.",
        price: 18.50,
        category: "Pizzas",
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian"],
        calories: 820,
        isPopular: true
      },
      {
        id: "pizza-2",
        name: "Diavola Calabrese",
        description: "Spicy Calabrian salami, smoked provolone, chili flakes, and hot honey drizzle.",
        price: 21.00,
        category: "Pizzas",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
        dietary: ["Spicy"],
        calories: 950,
        isPopular: true
      },
      {
        id: "pizza-3",
        name: "Truffle Wild Mushroom",
        description: "Roasted cremini & shiitake, white truffle crema, fontina cheese, and fresh thyme.",
        price: 23.50,
        category: "Pizzas",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian"],
        calories: 880,
        isPopular: false
      },
      {
        id: "pasta-1",
        name: "Handmade Rigatoni Alla Vodka",
        description: "Slow-simmered tomato vodka cream sauce, crispy pancetta, and 24-month aged parmesan.",
        price: 19.50,
        category: "Pastas",
        image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80",
        dietary: [],
        calories: 760,
        isPopular: true
      },
      {
        id: "salad-1",
        name: "Crispy Burrata & Heirloom Salad",
        description: "Local heirloom tomatoes, fresh pugliese burrata, basil pesto, and aged balsamic glaze.",
        price: 15.00,
        category: "Salads",
        image: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian", "Gluten-Free"],
        calories: 420,
        isPopular: false
      },
      {
        id: "dessert-1",
        name: "Espresso Tiramisu Classico",
        description: "Savoiardi ladyfingers soaked in espresso liqueur, whipped mascarpone, and dark cocoa dust.",
        price: 9.50,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian"],
        calories: 490,
        isPopular: true
      }
    ]
  },
  {
    id: "rest-2",
    name: "Smash & Sizzle Burger Lab",
    tagline: "Certified Angus beef, butter-toasted brioche & proprietary umami sauce",
    cuisine: ["American", "Burgers", "Comfort Food"],
    rating: 4.7,
    reviewCount: 680,
    deliveryTimeMinutes: "20-30",
    deliveryFee: 0.99,
    minOrder: 12.00,
    priceRange: "$$",
    bannerImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80",
    address: "88 Market St, Financial District",
    isPromoted: false,
    discountText: "Free Delivery on orders $25+",
    categories: ["Popular", "Smash Burgers", "Chicken", "Loaded Fries", "Shakes"],
    menu: [
      {
        id: "burger-1",
        name: "The Double Umami Smash",
        description: "Double smashed Angus patties, American cheddar, caramelized onions, house pickles, and secret smash sauce.",
        price: 14.95,
        category: "Smash Burgers",
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
        dietary: [],
        calories: 890,
        isPopular: true
      },
      {
        id: "burger-2",
        name: "Nashville Hot Fried Chicken",
        description: "Buttermilk fried chicken breast, cayenne glaze, tangy slaw, dill pickles on brioche.",
        price: 15.50,
        category: "Chicken",
        image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
        dietary: ["Spicy"],
        calories: 810,
        isPopular: true
      },
      {
        id: "burger-3",
        name: "Truffle & Garlic Parmesan Fries",
        description: "Crispy skin-on fries tossed with black truffle oil, garlic butter, and fresh pecorino.",
        price: 7.50,
        category: "Loaded Fries",
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian"],
        calories: 520,
        isPopular: true
      },
      {
        id: "burger-4",
        name: "Beyond Plant-Power Smash",
        description: "100% plant-based smashed patty, vegan smoked gouda, avocado mash, lettuce, tomato.",
        price: 16.00,
        category: "Smash Burgers",
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian", "Vegan"],
        calories: 650,
        isPopular: false
      }
    ]
  },
  {
    id: "rest-3",
    name: "Sakura Blossom Sushi & Omakase",
    tagline: "Wild-caught Tokyo fish market imports & ceremonial grade matcha",
    cuisine: ["Japanese", "Sushi", "Asian"],
    rating: 4.9,
    reviewCount: 512,
    deliveryTimeMinutes: "30-45",
    deliveryFee: 2.99,
    minOrder: 25.00,
    priceRange: "$$$",
    bannerImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=200&q=80",
    address: "210 Post St, Union Square",
    isPromoted: true,
    discountText: "Free Spicy Tuna Roll over $50",
    categories: ["Popular", "Nigiri & Sashimi", "Specialty Rolls", "Ramen", "Appetizers"],
    menu: [
      {
        id: "sushi-1",
        name: "Dragon Fire Roll",
        description: "Tempura shrimp, cucumber, topped with BBQ eel, avocado, tobiko, and unagi sauce.",
        price: 19.00,
        category: "Specialty Rolls",
        image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&q=80",
        dietary: [],
        calories: 580,
        isPopular: true
      },
      {
        id: "sushi-2",
        name: "Salmon Lover Omakase Box (12 pcs)",
        description: "4 Sake nigiri, 4 Seared belly nigiri with truffle, and 4 spicy salmon rolls.",
        price: 28.50,
        category: "Nigiri & Sashimi",
        image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80",
        dietary: ["Gluten-Free"],
        calories: 620,
        isPopular: true
      },
      {
        id: "sushi-3",
        name: "Tonkotsu Black Garlic Ramen",
        description: "16-hour pork bone broth, tender chashu belly, nitamago egg, wood ear mushroom, and black garlic oil.",
        price: 17.50,
        category: "Ramen",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        dietary: [],
        calories: 840,
        isPopular: true
      },
      {
        id: "sushi-4",
        name: "Steamed Edamame with Maldon Salt",
        description: "Organic young soybeans steamed with coarse sea salt and cracked pepper.",
        price: 6.50,
        category: "Appetizers",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian", "Vegan", "Gluten-Free"],
        calories: 140,
        isPopular: false
      }
    ]
  },
  {
    id: "rest-4",
    name: "Taj Mahal Spice Symphony",
    tagline: "Slow-simmered curries, clay-oven tandoor, & fragrant biryanis",
    cuisine: ["Indian", "Curry", "Vegetarian-Friendly"],
    rating: 4.9,
    reviewCount: 890,
    deliveryTimeMinutes: "25-40",
    deliveryFee: 1.49,
    minOrder: 15.00,
    priceRange: "$$",
    bannerImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80",
    address: "734 Valencia St, Mission District",
    isPromoted: false,
    discountText: "$5 Off First Order",
    categories: ["Popular", "Curries", "Biryani & Rice", "Tandoori Breads", "Appetizers"],
    menu: [
      {
        id: "ind-1",
        name: "Butter Chicken Delhi Style",
        description: "Charcoal-grilled chicken breast pieces simmered in silky tomato, butter, and fenugreek cream gravy.",
        price: 18.99,
        category: "Curries",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
        dietary: ["Gluten-Free"],
        calories: 780,
        isPopular: true
      },
      {
        id: "ind-2",
        name: "Paneer Tikka Masala",
        description: "Cottage cheese cubes tossed in spicy bell pepper, onion, and spiced tomato masala.",
        price: 17.50,
        category: "Curries",
        image: "https://images.unsplash.com/photo-1567184109171-9661c3d14488?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian", "Gluten-Free", "Spicy"],
        calories: 690,
        isPopular: true
      },
      {
        id: "ind-3",
        name: "Garlic Butter Naan",
        description: "Clay oven baked traditional leavened flatbread brushed with garlic butter and fresh cilantro.",
        price: 4.50,
        category: "Tandoori Breads",
        image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian"],
        calories: 280,
        isPopular: true
      },
      {
        id: "ind-4",
        name: "Hyderabadi Dum Dum Biryani",
        description: "Fragrant basmati rice layered with aromatic saffron, fried onions, and spiced tender chicken.",
        price: 19.50,
        category: "Biryani & Rice",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
        dietary: ["Gluten-Free", "Spicy"],
        calories: 820,
        isPopular: true
      }
    ]
  },
  {
    id: "rest-5",
    name: "Green Goddess Harvest Bowls",
    tagline: "Organic, sustainably sourced superfood bowls, cold-pressed elixirs & wraps",
    cuisine: ["Healthy", "Salads", "Vegan"],
    rating: 4.8,
    reviewCount: 340,
    deliveryTimeMinutes: "15-25",
    deliveryFee: 1.99,
    minOrder: 14.00,
    priceRange: "$$",
    bannerImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80",
    address: "520 Hayes St, Hayes Valley",
    isPromoted: false,
    discountText: "10% off healthy combos",
    categories: ["Popular", "Signature Warm Bowls", "Crisp Salads", "Cold Pressed Juices"],
    menu: [
      {
        id: "health-1",
        name: "Avocado & Wild Salmon Super Bowl",
        description: "Organic quinoa, pan-seared salmon, Hass avocado, massaged kale, roasted beets, and lemon tahini dressing.",
        price: 17.95,
        category: "Signature Warm Bowls",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        dietary: ["Gluten-Free"],
        calories: 560,
        isPopular: true
      },
      {
        id: "health-2",
        name: "Crispy Tofu Rainbow Grain Bowl",
        description: "Marinated crispy sesame tofu, purple cabbage, edamame, shredded carrots, brown rice, peanut lime dressing.",
        price: 15.50,
        category: "Signature Warm Bowls",
        image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian", "Vegan", "Gluten-Free"],
        calories: 480,
        isPopular: true
      },
      {
        id: "health-3",
        name: "Detox Glow Green Juice",
        description: "Cold-pressed cucumber, celery, green apple, kale, ginger, and lemon.",
        price: 7.95,
        category: "Cold Pressed Juices",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian", "Vegan", "Gluten-Free"],
        calories: 110,
        isPopular: false
      }
    ]
  },
  {
    id: "rest-6",
    name: "Taquería El Sol Dorado",
    tagline: "Authentic Michoacán carnitas, street tacos & house-pressed corn tortillas",
    cuisine: ["Mexican", "Tacos", "Street Food"],
    rating: 4.7,
    reviewCount: 920,
    deliveryTimeMinutes: "20-35",
    deliveryFee: 0.99,
    minOrder: 10.00,
    priceRange: "$",
    bannerImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=200&q=80",
    address: "2480 Mission St, Mission District",
    isPromoted: false,
    discountText: "$3 Tacos Every Tuesday",
    categories: ["Popular", "Street Tacos", "Burritos", "Quesadillas", "Sides & Drinks"],
    menu: [
      {
        id: "mex-1",
        name: "Crispy Carnitas Street Tacos (3 pcs)",
        description: "Slow-roasted citrus pork, diced white onion, cilantro, roasted salsa verde on warm corn tortillas.",
        price: 12.50,
        category: "Street Tacos",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80",
        dietary: ["Gluten-Free"],
        calories: 520,
        isPopular: true
      },
      {
        id: "mex-2",
        name: "Mission Cali Burrito",
        description: "Grilled carne asada, crispy fries, guacamole, melted Monterey jack, and chipotle crema wrapped in a flour tortilla.",
        price: 14.50,
        category: "Burritos",
        image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80",
        dietary: [],
        calories: 980,
        isPopular: true
      },
      {
        id: "mex-3",
        name: "Churros con Chocolate Caliente",
        description: "Golden fried Mexican pastry tossed in cinnamon sugar with spiced dark chocolate dipping sauce.",
        price: 6.50,
        category: "Sides & Drinks",
        image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80",
        dietary: ["Vegetarian"],
        calories: 390,
        isPopular: true
      }
    ]
  }
];

export const MOCK_RECOMMENDATIONS = [
  {
    id: "rec-1",
    dishName: "Classic Margherita DOP",
    restaurantId: "rest-1",
    restaurantName: "Artisan Wood-Fired Pizza Co.",
    rating: 4.9,
    price: 18.50,
    deliveryTimeMinutes: "25-35",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80",
    aiBadge: "🔥 #1 Most Ordered Today",
    reason: "Because you like authentic Italian and wood-fired crusts"
  },
  {
    id: "rec-2",
    dishName: "The Double Umami Smash",
    restaurantId: "rest-2",
    restaurantName: "Smash & Sizzle Burger Lab",
    rating: 4.8,
    price: 14.95,
    deliveryTimeMinutes: "20-30",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
    aiBadge: "⭐ Top Rated Comfort Food",
    reason: "High reorder rate (94%) among diners in your neighborhood"
  },
  {
    id: "rec-3",
    dishName: "Dragon Fire Roll",
    restaurantId: "rest-3",
    restaurantName: "Sakura Blossom Sushi & Omakase",
    rating: 4.9,
    price: 19.00,
    deliveryTimeMinutes: "30-45",
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&q=80",
    aiBadge: "🍣 Chef's Special Pick",
    reason: "Pairs with your recent Asian dinner preferences"
  },
  {
    id: "rec-4",
    dishName: "Butter Chicken Delhi Style",
    restaurantId: "rest-4",
    restaurantName: "Taj Mahal Spice Symphony",
    rating: 4.9,
    price: 18.99,
    deliveryTimeMinutes: "25-40",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    aiBadge: "🍛 Warm Comfort Pick",
    reason: "Perfect for a cozy weekend dinner"
  },
  {
    id: "rec-5",
    dishName: "Avocado & Wild Salmon Super Bowl",
    restaurantId: "rest-5",
    restaurantName: "Green Goddess Harvest Bowls",
    rating: 4.8,
    price: 17.95,
    deliveryTimeMinutes: "15-25",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    aiBadge: "🌱 Healthy High-Protein",
    reason: "Nutrient-packed lunch with fresh avocado & salmon"
  }
];

export const MOCK_DRIVER = {
  id: "drv-884",
  name: "Marcus Vance",
  phone: "+1 (415) 555-0199",
  photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  rating: 4.94,
  totalDeliveries: "2,430+",
  vehicle: "Toyota Prius (Hybrid)",
  color: "Silver Metallic",
  licensePlate: "7XYZ892",
  currentLocation: {
    lat: 37.7749,
    lng: -122.4194
  }
};
