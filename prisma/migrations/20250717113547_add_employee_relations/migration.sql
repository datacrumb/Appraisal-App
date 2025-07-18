-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('MANAGER', 'LEAD', 'COLLEAGUE');

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeRelation" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" "RelationType" NOT NULL,

    CONSTRAINT "EmployeeRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- AddForeignKey
ALTER TABLE "EmployeeRelation" ADD CONSTRAINT "EmployeeRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRelation" ADD CONSTRAINT "EmployeeRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
