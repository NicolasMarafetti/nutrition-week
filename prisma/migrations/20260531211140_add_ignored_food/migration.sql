-- CreateTable
CREATE TABLE "IgnoredFood" (
    "fdcId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ignoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IgnoredFood_pkey" PRIMARY KEY ("fdcId")
);
