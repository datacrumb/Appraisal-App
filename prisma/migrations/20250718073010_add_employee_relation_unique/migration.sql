/*
  Warnings:

  - A unique constraint covering the columns `[fromId,toId,type]` on the table `EmployeeRelation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRelation_fromId_toId_type_key" ON "EmployeeRelation"("fromId", "toId", "type");
