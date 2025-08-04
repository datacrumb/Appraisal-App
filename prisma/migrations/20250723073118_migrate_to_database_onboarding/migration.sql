-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isLead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isManager" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "role" TEXT;

-- CreateTable
CREATE TABLE "OnboardingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isManager" BOOLEAN NOT NULL DEFAULT false,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "managerEmail" TEXT,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,

    CONSTRAINT "OnboardingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRequest_userId_key" ON "OnboardingRequest"("userId");

-- AddForeignKey
ALTER TABLE "OnboardingRequest" ADD CONSTRAINT "OnboardingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
