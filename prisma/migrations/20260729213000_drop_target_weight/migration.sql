-- L'objectif de corpulence est désormais exprimé en % de masse grasse
-- (Profile.targetBodyFatPct) ; le poids correspondant en est déduit.
-- targetWeightKg n'alimentait aucun calcul, il n'était qu'affiché.

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "targetWeightKg";
