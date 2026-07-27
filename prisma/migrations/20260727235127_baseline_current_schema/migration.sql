-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "abbyReference" TEXT,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "plate" TEXT,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "mileage" INTEGER,
    "mileageUpdatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "soldAt" TIMESTAMP(3),
    "previousOwnerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelLog" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" DECIMAL(6,2) NOT NULL,
    "mileage" INTEGER,
    "trackedByBank" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "normalPrice" DECIMAL(10,2),
    "price" DECIMAL(10,2),
    "bookedOnline" BOOLEAN NOT NULL DEFAULT false,
    "calcomBookingUid" TEXT,
    "depositAmount" DECIMAL(10,2),
    "depositDate" TIMESTAMP(3),
    "deliveryPrice" DECIMAL(10,2),
    "dossierFee" DECIMAL(10,2),
    "distanceKm" DECIMAL(6,2),
    "travelFee" DECIMAL(10,2),
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photosBefore" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photosAfter" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "toolLink" TEXT,
    "vehicleCondition" TEXT,
    "mileage" INTEGER,
    "hoursSpent" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'done',
    "chronoStartedAt" TIMESTAMP(3),
    "abbyInvoiceNumber" TEXT,
    "maintenanceTypeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartUsed" (
    "id" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "reference" TEXT,
    "quantity" TEXT,
    "link" TEXT,
    "price" DECIMAL(10,2),
    "boughtByClient" BOOLEAN NOT NULL DEFAULT false,
    "stockPartId" TEXT,
    "quantityUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartUsed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedRepair" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "partsNote" TEXT,
    "estimatedPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannedRepair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceType" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "defaultIntervalMonths" INTEGER,
    "defaultIntervalKm" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MaintenanceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL,
    "hourlyRate" DECIMAL(6,2) NOT NULL DEFAULT 60,
    "urssafRate" DECIMAL(5,2) NOT NULL DEFAULT 21.2,
    "travelRatePerKm" DECIMAL(5,2) NOT NULL DEFAULT 0.35,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT,
    "category" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT,
    "condition" TEXT,
    "notes" TEXT,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleYears" TEXT,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPhoto" (
    "id" TEXT NOT NULL,
    "stockPartId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "maintenanceTypeId" TEXT NOT NULL,
    "lastDoneDate" TIMESTAMP(3),
    "lastDoneMileage" INTEGER,
    "intervalMonthsOverride" INTEGER,
    "intervalKmOverride" INTEGER,
    "updatedByClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_abbyReference_key" ON "Client"("abbyReference");

-- CreateIndex
CREATE INDEX "Client_lastName_firstName_idx" ON "Client"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Vehicle_clientId_idx" ON "Vehicle"("clientId");

-- CreateIndex
CREATE INDEX "FuelLog_vehicleId_idx" ON "FuelLog"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Intervention_calcomBookingUid_key" ON "Intervention"("calcomBookingUid");

-- CreateIndex
CREATE UNIQUE INDEX "Intervention_abbyInvoiceNumber_key" ON "Intervention"("abbyInvoiceNumber");

-- CreateIndex
CREATE INDEX "Intervention_vehicleId_idx" ON "Intervention"("vehicleId");

-- CreateIndex
CREATE INDEX "Payment_interventionId_idx" ON "Payment"("interventionId");

-- CreateIndex
CREATE INDEX "PartUsed_interventionId_idx" ON "PartUsed"("interventionId");

-- CreateIndex
CREATE INDEX "PartUsed_stockPartId_idx" ON "PartUsed"("stockPartId");

-- CreateIndex
CREATE INDEX "PlannedRepair_vehicleId_idx" ON "PlannedRepair"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceType_key_key" ON "MaintenanceType"("key");

-- CreateIndex
CREATE INDEX "StockPhoto_stockPartId_idx" ON "StockPhoto"("stockPartId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceRecord_vehicleId_maintenanceTypeId_key" ON "MaintenanceRecord"("vehicleId", "maintenanceTypeId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_maintenanceTypeId_fkey" FOREIGN KEY ("maintenanceTypeId") REFERENCES "MaintenanceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartUsed" ADD CONSTRAINT "PartUsed_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartUsed" ADD CONSTRAINT "PartUsed_stockPartId_fkey" FOREIGN KEY ("stockPartId") REFERENCES "StockPart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedRepair" ADD CONSTRAINT "PlannedRepair_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPhoto" ADD CONSTRAINT "StockPhoto_stockPartId_fkey" FOREIGN KEY ("stockPartId") REFERENCES "StockPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_maintenanceTypeId_fkey" FOREIGN KEY ("maintenanceTypeId") REFERENCES "MaintenanceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

