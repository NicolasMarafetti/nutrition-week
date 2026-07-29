-- AlterEnum
ALTER TYPE "MealType" ADD VALUE 'MORNING_SNACK';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bodyFatPct" DOUBLE PRECISION,
ADD COLUMN     "targetBodyFatPct" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "BodyMeasurement" (
    "id" SERIAL NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "musclePct" DOUBLE PRECISION,
    "muscleMassKg" DOUBLE PRECISION,
    "waterPct" DOUBLE PRECISION,
    "proteinPct" DOUBLE PRECISION,
    "boneMassKg" DOUBLE PRECISION,
    "visceralFat" DOUBLE PRECISION,
    "bmrKcal" DOUBLE PRECISION,
    "subcutaneousFatPct" DOUBLE PRECISION,
    "skeletalMusclePct" DOUBLE PRECISION,
    "metabolicAge" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'feelfit',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BodyMeasurement_measuredAt_key" ON "BodyMeasurement"("measuredAt");

-- CreateIndex
CREATE INDEX "BodyMeasurement_measuredAt_idx" ON "BodyMeasurement"("measuredAt");
