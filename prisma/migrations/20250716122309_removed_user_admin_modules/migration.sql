/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_responderId_fkey";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";
