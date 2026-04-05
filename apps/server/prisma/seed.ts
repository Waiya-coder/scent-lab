import { PrismaClient, type Climate, type FragranceFamily, type Intensity, type Lifestyle, type Mood, type Personality } from "@prisma/client";

const prisma = new PrismaClient();

const fragranceSeeds: Array<{
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  family: FragranceFamily;
  imageUrl: string;
  productUrl: string;
  longevity: number;
  sillage: Intensity;
  refillable: boolean;
  sustainabilityScore: number;
  accords: {
    citrus: number;
    floral: number;
    woods: number;
    musk: number;
    spice: number;
    green: number;
  };
  notes: string[];
  bestFor: {
    lifestyles: Lifestyle[];
    personalities: Personality[];
    climates: Climate[];
    moods: Mood[];
  };
}> = [
  {
    slug: "bal-dafrique",
    brand: "BYREDO",
    name: "Bal d'Afrique",
    tagline: "Bright bergamot, marigold, and vetiver with an upbeat, polished warmth.",
    family: "citrus",
    imageUrl:
      "https://www.byredo.com/cdn-cgi/image/width%3Dauto%2Cheight%3D1200%2Cfit%3Dscale-down%2Cgravity%3Dauto%2Cformat%3Dwebp%2Cquality%3D70/https%3A//www.byredo.com/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/1/0/10000038_1_full_no.jpg",
    productUrl: "https://www.byredo.com/us_en/p/bal-d-afrique-eau-de-parfum?sku=0065204863",
    longevity: 7,
    sillage: "balanced",
    refillable: false,
    sustainabilityScore: 70,
    accords: {
      citrus: 78,
      floral: 52,
      woods: 38,
      musk: 34,
      spice: 16,
      green: 30
    },
    notes: ["bergamot", "blackcurrant", "violet", "vetiver"],
    bestFor: {
      lifestyles: ["traveler", "urban", "creative"],
      personalities: ["curious", "luxurious", "romantic"],
      climates: ["hot", "temperate", "humid"],
      moods: ["energizing", "playful", "serene"]
    }
  },
  {
    slug: "philosykos",
    brand: "Diptyque",
    name: "Philosykos",
    tagline: "The freshness of fig leaves, fig sap, and white wood in a breezy green veil.",
    family: "green",
    imageUrl: "https://www.diptyqueparis.com/media/catalog/product/d/i/diptyque-philosykos-eau-de-toilette-50ml-philo50-1.jpg",
    productUrl: "https://www.diptyqueparis.com/en_us/p/philosykos-eau-de-toilette-100ml-1.html",
    longevity: 6,
    sillage: "soft",
    refillable: false,
    sustainabilityScore: 74,
    accords: {
      citrus: 22,
      floral: 18,
      woods: 48,
      musk: 12,
      spice: 14,
      green: 90
    },
    notes: ["fig leaves", "fig tree sap", "fig wood", "black pepper"],
    bestFor: {
      lifestyles: ["outdoorsy", "wellness", "creative"],
      personalities: ["grounded", "curious"],
      climates: ["hot", "temperate", "humid"],
      moods: ["grounded", "serene", "playful"]
    }
  },
  {
    slug: "santal-33",
    brand: "Le Labo",
    name: "Santal 33",
    tagline: "A cult woody signature built around sandalwood, cedar, cardamom, and leather.",
    family: "woody",
    imageUrl: "https://lelabo.ips.photos/lelabo-java/images/skus/050PS33100__PRODUCT_01--IMG_1200--SANTAL33--79960236.jpg",
    productUrl: "https://www.lelabofragrances.com/santal-33-147.html",
    longevity: 9,
    sillage: "statement",
    refillable: true,
    sustainabilityScore: 82,
    accords: {
      citrus: 8,
      floral: 10,
      woods: 88,
      musk: 38,
      spice: 44,
      green: 12
    },
    notes: ["sandalwood", "cedarwood", "cardamom", "leather"],
    bestFor: {
      lifestyles: ["urban", "traveler", "creative"],
      personalities: ["bold", "grounded", "luxurious"],
      climates: ["cold", "dry", "temperate"],
      moods: ["grounded", "sensual", "serene"]
    }
  },
  {
    slug: "by-the-fireplace",
    brand: "Maison Margiela REPLICA",
    name: "By the Fireplace",
    tagline: "Chestnut, vanilla, and smoky woods for a warm fireside feel.",
    family: "amber",
    imageUrl:
      "https://www.maisonmargiela-fragrances.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-margiela-master-catalog/default/dwf81b4955/images/products/MM005/Updated%20Images/MM005_MAIN.jpg?q=70&sfrm=jpg&sh=320&sm=cut&sw=320",
    productUrl: "https://www.maisonmargiela-fragrances.us/fragrances/replica/replica-by-the-fireplace/MM005.html",
    longevity: 10,
    sillage: "statement",
    refillable: false,
    sustainabilityScore: 60,
    accords: {
      citrus: 8,
      floral: 12,
      woods: 52,
      musk: 48,
      spice: 82,
      green: 10
    },
    notes: ["chestnut", "vanilla", "clove", "cashmeran"],
    bestFor: {
      lifestyles: ["urban", "traveler"],
      personalities: ["bold", "luxurious"],
      climates: ["cold", "dry"],
      moods: ["sensual", "grounded"]
    }
  }
];

async function main() {
  const store = await prisma.store.upsert({
    where: {
      slug: "flagship-atlanta"
    },
    update: {
      name: "Scent Lab Flagship",
      city: "Atlanta",
      region: "GA"
    },
    create: {
      slug: "flagship-atlanta",
      name: "Scent Lab Flagship",
      city: "Atlanta",
      region: "GA"
    }
  });

  for (const fragrance of fragranceSeeds) {
    const fragranceRecord = await prisma.fragrance.upsert({
      where: {
        slug: fragrance.slug
      },
      update: {
        brand: fragrance.brand,
        name: fragrance.name,
        tagline: fragrance.tagline,
        family: fragrance.family,
        imageUrl: fragrance.imageUrl,
        productUrl: fragrance.productUrl,
        longevity: fragrance.longevity,
        sillage: fragrance.sillage,
        refillable: fragrance.refillable,
        sustainabilityScore: fragrance.sustainabilityScore,
        citrus: fragrance.accords.citrus,
        floral: fragrance.accords.floral,
        woods: fragrance.accords.woods,
        musk: fragrance.accords.musk,
        spice: fragrance.accords.spice,
        green: fragrance.accords.green
      },
      create: {
        slug: fragrance.slug,
        brand: fragrance.brand,
        name: fragrance.name,
        tagline: fragrance.tagline,
        family: fragrance.family,
        imageUrl: fragrance.imageUrl,
        productUrl: fragrance.productUrl,
        longevity: fragrance.longevity,
        sillage: fragrance.sillage,
        refillable: fragrance.refillable,
        sustainabilityScore: fragrance.sustainabilityScore,
        citrus: fragrance.accords.citrus,
        floral: fragrance.accords.floral,
        woods: fragrance.accords.woods,
        musk: fragrance.accords.musk,
        spice: fragrance.accords.spice,
        green: fragrance.accords.green
      }
    });

    await prisma.fragranceNote.deleteMany({
      where: {
        fragranceId: fragranceRecord.id
      }
    });

    await prisma.fragranceTarget.deleteMany({
      where: {
        fragranceId: fragranceRecord.id
      }
    });

    await prisma.fragranceNote.createMany({
      data: fragrance.notes.map((noteName) => ({
        fragranceId: fragranceRecord.id,
        noteName
      }))
    });

    const targets = [
      ...fragrance.bestFor.lifestyles.map((value) => ({ dimension: "lifestyle", value })),
      ...fragrance.bestFor.personalities.map((value) => ({ dimension: "personality", value })),
      ...fragrance.bestFor.climates.map((value) => ({ dimension: "climate", value })),
      ...fragrance.bestFor.moods.map((value) => ({ dimension: "mood", value }))
    ];

    await prisma.fragranceTarget.createMany({
      data: targets.map((target) => ({
        fragranceId: fragranceRecord.id,
        dimension: target.dimension,
        value: target.value,
        weight: 1
      }))
    });

    await prisma.storeInventory.upsert({
      where: {
        storeId_fragranceId: {
          storeId: store.id,
          fragranceId: fragranceRecord.id
        }
      },
      update: {
        isAvailable: true,
        testerAvailable: true,
        stockLevel: 12
      },
      create: {
        storeId: store.id,
        fragranceId: fragranceRecord.id,
        isAvailable: true,
        testerAvailable: true,
        stockLevel: 12
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
