-- CreateEnum
CREATE TYPE "FragranceFamily" AS ENUM ('citrus', 'floral', 'woody', 'amber', 'green', 'spice');

-- CreateEnum
CREATE TYPE "Intensity" AS ENUM ('soft', 'balanced', 'statement');

-- CreateEnum
CREATE TYPE "Lifestyle" AS ENUM ('creative', 'outdoorsy', 'urban', 'wellness', 'traveler');

-- CreateEnum
CREATE TYPE "Personality" AS ENUM ('bold', 'romantic', 'grounded', 'curious', 'luxurious');

-- CreateEnum
CREATE TYPE "Climate" AS ENUM ('hot', 'temperate', 'cold', 'humid', 'dry');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('energizing', 'sensual', 'grounded', 'playful', 'serene');

-- CreateTable
CREATE TABLE "Fragrance" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "family" "FragranceFamily" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "longevity" INTEGER NOT NULL,
    "sillage" "Intensity" NOT NULL,
    "refillable" BOOLEAN NOT NULL,
    "sustainabilityScore" INTEGER NOT NULL,
    "citrus" INTEGER NOT NULL,
    "floral" INTEGER NOT NULL,
    "woods" INTEGER NOT NULL,
    "musk" INTEGER NOT NULL,
    "spice" INTEGER NOT NULL,
    "green" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fragrance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FragranceNote" (
    "id" TEXT NOT NULL,
    "fragranceId" TEXT NOT NULL,
    "noteName" TEXT NOT NULL,

    CONSTRAINT "FragranceNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FragranceTarget" (
    "id" TEXT NOT NULL,
    "fragranceId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "FragranceTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreInventory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "fragranceId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "testerAvailable" BOOLEAN NOT NULL DEFAULT true,
    "stockLevel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoreInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveySession" (
    "id" TEXT NOT NULL,
    "storeId" TEXT,
    "customerName" TEXT,
    "lifestyle" "Lifestyle" NOT NULL,
    "personality" "Personality" NOT NULL,
    "climate" "Climate" NOT NULL,
    "mood" "Mood" NOT NULL,
    "intensity" "Intensity" NOT NULL,
    "refillPreference" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyRecommendation" (
    "id" TEXT NOT NULL,
    "surveySessionId" TEXT NOT NULL,
    "fragranceId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fragrance_slug_key" ON "Fragrance"("slug");

-- CreateIndex
CREATE INDEX "FragranceNote_fragranceId_idx" ON "FragranceNote"("fragranceId");

-- CreateIndex
CREATE INDEX "FragranceTarget_fragranceId_idx" ON "FragranceTarget"("fragranceId");

-- CreateIndex
CREATE INDEX "FragranceTarget_dimension_value_idx" ON "FragranceTarget"("dimension", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "StoreInventory_storeId_idx" ON "StoreInventory"("storeId");

-- CreateIndex
CREATE INDEX "StoreInventory_fragranceId_idx" ON "StoreInventory"("fragranceId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreInventory_storeId_fragranceId_key" ON "StoreInventory"("storeId", "fragranceId");

-- CreateIndex
CREATE INDEX "SurveySession_storeId_idx" ON "SurveySession"("storeId");

-- CreateIndex
CREATE INDEX "SurveySession_createdAt_idx" ON "SurveySession"("createdAt");

-- CreateIndex
CREATE INDEX "SurveyRecommendation_surveySessionId_idx" ON "SurveyRecommendation"("surveySessionId");

-- CreateIndex
CREATE INDEX "SurveyRecommendation_fragranceId_idx" ON "SurveyRecommendation"("fragranceId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyRecommendation_surveySessionId_rank_key" ON "SurveyRecommendation"("surveySessionId", "rank");

-- AddForeignKey
ALTER TABLE "FragranceNote" ADD CONSTRAINT "FragranceNote_fragranceId_fkey" FOREIGN KEY ("fragranceId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FragranceTarget" ADD CONSTRAINT "FragranceTarget_fragranceId_fkey" FOREIGN KEY ("fragranceId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_fragranceId_fkey" FOREIGN KEY ("fragranceId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveySession" ADD CONSTRAINT "SurveySession_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecommendation" ADD CONSTRAINT "SurveyRecommendation_surveySessionId_fkey" FOREIGN KEY ("surveySessionId") REFERENCES "SurveySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecommendation" ADD CONSTRAINT "SurveyRecommendation_fragranceId_fkey" FOREIGN KEY ("fragranceId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
