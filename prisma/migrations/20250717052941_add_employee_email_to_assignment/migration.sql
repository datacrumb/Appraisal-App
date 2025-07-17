/*
  Warnings:

  - Added the required column `employeeEmail` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "employeeEmail" TEXT NOT NULL;
