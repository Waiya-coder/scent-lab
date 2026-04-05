import type { Fragrance } from "@scent-lab/shared";
import type { Fragrance as PrismaFragrance, FragranceNote, FragranceTarget } from "@prisma/client";

type FragranceWithRelations = PrismaFragrance & {
  notes: FragranceNote[];
  targets: FragranceTarget[];
};

export function mapFragrance(record: FragranceWithRelations): Fragrance {
  return {
    id: record.slug,
    brand: record.brand,
    name: record.name,
    tagline: record.tagline,
    family: record.family,
    notes: record.notes.map((note) => note.noteName),
    imageUrl: record.imageUrl,
    productUrl: record.productUrl,
    bestFor: {
      lifestyles: record.targets
        .filter((target) => target.dimension === "lifestyle")
        .map((target) => target.value) as Fragrance["bestFor"]["lifestyles"],
      personalities: record.targets
        .filter((target) => target.dimension === "personality")
        .map((target) => target.value) as Fragrance["bestFor"]["personalities"],
      climates: record.targets
        .filter((target) => target.dimension === "climate")
        .map((target) => target.value) as Fragrance["bestFor"]["climates"],
      moods: record.targets
        .filter((target) => target.dimension === "mood")
        .map((target) => target.value) as Fragrance["bestFor"]["moods"]
    },
    longevity: record.longevity,
    sillage: record.sillage,
    refillable: record.refillable,
    sustainabilityScore: record.sustainabilityScore,
    accordLevels: {
      citrus: record.citrus,
      floral: record.floral,
      woods: record.woods,
      musk: record.musk,
      spice: record.spice,
      green: record.green
    }
  };
}
