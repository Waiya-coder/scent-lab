import type { Fragrance } from "@scent-lab/shared";

export const fragrances: Fragrance[] = [
  {
    id: "bal-dafrique",
    brand: "BYREDO",
    name: "Bal d'Afrique",
    tagline: "Bright bergamot, marigold, and vetiver with an upbeat, polished warmth.",
    family: "citrus",
    notes: ["bergamot", "blackcurrant", "violet", "vetiver"],
    imageUrl:
      "https://www.byredo.com/cdn-cgi/image/width%3Dauto%2Cheight%3D1200%2Cfit%3Dscale-down%2Cgravity%3Dauto%2Cformat%3Dwebp%2Cquality%3D70/https%3A//www.byredo.com/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/1/0/10000038_1_full_no.jpg",
    productUrl: "https://www.byredo.com/us_en/p/bal-d-afrique-eau-de-parfum?sku=0065204863",
    bestFor: {
      lifestyles: ["traveler", "urban", "creative"],
      personalities: ["curious", "luxurious", "romantic"],
      climates: ["hot", "temperate", "humid"],
      moods: ["energizing", "playful", "serene"]
    },
    longevity: 7,
    sillage: "balanced",
    refillable: false,
    sustainabilityScore: 70,
    accordLevels: {
      citrus: 78,
      floral: 52,
      woods: 38,
      musk: 34,
      spice: 16,
      green: 30
    }
  },
  {
    id: "philosykos",
    brand: "Diptyque",
    name: "Philosykos",
    tagline: "The freshness of fig leaves, fig sap, and white wood in a breezy green veil.",
    family: "green",
    notes: ["fig leaves", "fig tree sap", "fig wood", "black pepper"],
    imageUrl:
      "https://www.diptyqueparis.com/media/catalog/product/d/i/diptyque-philosykos-eau-de-toilette-50ml-philo50-1.jpg",
    productUrl: "https://www.diptyqueparis.com/en_us/p/philosykos-eau-de-toilette-100ml-1.html",
    bestFor: {
      lifestyles: ["outdoorsy", "wellness", "creative"],
      personalities: ["grounded", "curious"],
      climates: ["hot", "temperate", "humid"],
      moods: ["grounded", "serene", "playful"]
    },
    longevity: 6,
    sillage: "soft",
    refillable: false,
    sustainabilityScore: 74,
    accordLevels: {
      citrus: 22,
      floral: 18,
      woods: 48,
      musk: 12,
      spice: 14,
      green: 90
    }
  },
  {
    id: "santal-33",
    brand: "Le Labo",
    name: "Santal 33",
    tagline: "A cult woody signature built around sandalwood, cedar, cardamom, and leather.",
    family: "woody",
    notes: ["sandalwood", "cedarwood", "cardamom", "leather"],
    imageUrl:
      "https://lelabo.ips.photos/lelabo-java/images/skus/050PS33100__PRODUCT_01--IMG_1200--SANTAL33--79960236.jpg",
    productUrl: "https://www.lelabofragrances.com/santal-33-147.html",
    bestFor: {
      lifestyles: ["urban", "traveler", "creative"],
      personalities: ["bold", "grounded", "luxurious"],
      climates: ["cold", "dry", "temperate"],
      moods: ["grounded", "sensual", "serene"]
    },
    longevity: 9,
    sillage: "statement",
    refillable: true,
    sustainabilityScore: 82,
    accordLevels: {
      citrus: 8,
      floral: 10,
      woods: 88,
      musk: 38,
      spice: 44,
      green: 12
    }
  },
  {
    id: "by-the-fireplace",
    brand: "Maison Margiela REPLICA",
    name: "By the Fireplace",
    tagline: "Chestnut, vanilla, and smoky woods for a warm fireside feel.",
    family: "amber",
    notes: ["chestnut", "vanilla", "clove", "cashmeran"],
    imageUrl:
      "https://www.maisonmargiela-fragrances.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-margiela-master-catalog/default/dwf81b4955/images/products/MM005/Updated%20Images/MM005_MAIN.jpg?q=70&sfrm=jpg&sh=320&sm=cut&sw=320",
    productUrl: "https://www.maisonmargiela-fragrances.us/fragrances/replica/replica-by-the-fireplace/MM005.html",
    bestFor: {
      lifestyles: ["urban", "traveler"],
      personalities: ["bold", "luxurious"],
      climates: ["cold", "dry"],
      moods: ["sensual", "grounded"]
    },
    longevity: 10,
    sillage: "statement",
    refillable: false,
    sustainabilityScore: 60,
    accordLevels: {
      citrus: 8,
      floral: 12,
      woods: 52,
      musk: 48,
      spice: 82,
      green: 10
    }
  }
];
