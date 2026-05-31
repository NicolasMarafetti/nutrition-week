-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACK', 'DINNER');

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "age" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "targetWeightKg" DOUBLE PRECISION NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "sex" "Sex" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "fdcId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "nutrients" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("fdcId")
);

-- CreateTable
CREATE TABLE "CustomFood" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nutrients" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" SERIAL NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "meal" "MealType" NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "foodId" INTEGER,
    "customFoodId" INTEGER,

    CONSTRAINT "MealEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealEntry_day_meal_foodId_key" ON "MealEntry"("day", "meal", "foodId");

-- CreateIndex
CREATE UNIQUE INDEX "MealEntry_day_meal_customFoodId_key" ON "MealEntry"("day", "meal", "customFoodId");

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("fdcId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_customFoodId_fkey" FOREIGN KEY ("customFoodId") REFERENCES "CustomFood"("id") ON DELETE SET NULL ON UPDATE CASCADE;
