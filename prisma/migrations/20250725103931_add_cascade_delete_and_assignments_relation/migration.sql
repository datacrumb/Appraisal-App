-- DropForeignKey
ALTER TABLE "EmployeeRelation" DROP CONSTRAINT "EmployeeRelation_fromId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeRelation" DROP CONSTRAINT "EmployeeRelation_toId_fkey";

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRelation" ADD CONSTRAINT "EmployeeRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRelation" ADD CONSTRAINT "EmployeeRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
