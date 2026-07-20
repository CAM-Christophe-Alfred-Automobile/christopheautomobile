-- AlterTable
ALTER TABLE "Intervention" ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "sold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "soldAt" TIMESTAMP(3);
