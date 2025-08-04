import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRelations() {
  try {
    console.log('🔍 Checking all employee relations...\n');
    
    const relations = await prisma.employeeRelation.findMany({
      include: {
        from: true,
        to: true,
      },
    });

    console.log(`📊 Found ${relations.length} relations:\n`);
    
    relations.forEach((relation, index) => {
      console.log(`${index + 1}. ${relation.from.firstName} ${relation.from.lastName} (${relation.from.role}) → ${relation.to.firstName} ${relation.to.lastName} (${relation.to.role})`);
      console.log(`   Type: ${relation.type}`);
      console.log(`   IDs: ${relation.fromId} → ${relation.toId}\n`);
    });

    if (relations.length === 0) {
      console.log('❌ No relations found in the database.');
    }

    // Also check all employees
    console.log('👥 All employees:');
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'asc' },
    });

    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.role}) - ID: ${emp.id}`);
    });

  } catch (error) {
    console.error('❌ Error checking relations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRelations(); 