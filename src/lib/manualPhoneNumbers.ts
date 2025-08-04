import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Sample phone numbers for testing
const samplePhoneNumbers = [
  '+1 (555) 123-4567',
  '+1 (555) 234-5678', 
  '+1 (555) 345-6789',
  '+1 (555) 456-7890',
  '+1 (555) 567-8901',
  '+1 (555) 678-9012',
  '+1 (555) 789-0123',
  '+1 (555) 890-1234',
  '+1 (555) 901-2345',
  '+1 (555) 012-3456',
  '+1 (555) 111-2222',
  '+1 (555) 222-3333',
  '+1 (555) 333-4444',
  '+1 (555) 444-5555',
  '+1 (555) 555-6666'
];

async function addSamplePhoneNumbers() {
  try {
    console.log('📞 Adding sample phone numbers to employees...');
    
    // Get all employees without phone numbers
    const employees = await prisma.employee.findMany({
      where: {
        phoneNumber: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });
    
    console.log(`Found ${employees.length} employees without phone numbers.`);
    
    if (employees.length === 0) {
      console.log('✅ All employees already have phone numbers!');
      return;
    }
    
    // Add sample phone numbers
    for (let i = 0; i < employees.length; i++) {
      const phoneNumber = samplePhoneNumbers[i % samplePhoneNumbers.length];
      
      await prisma.employee.update({
        where: { id: employees[i].id },
        data: { phoneNumber }
      });
      
      const name = `${employees[i].firstName || 'Unknown'} ${employees[i].lastName || 'Unknown'}`;
      console.log(`✅ Updated ${name} (${employees[i].email}) with phone: ${phoneNumber}`);
    }
    
    console.log('\n🎉 All employees updated with sample phone numbers!');
    
  } catch (error) {
    console.error('❌ Error adding phone numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function showEmployeesWithPhoneNumbers() {
  try {
    console.log('📋 Employees with phone numbers:');
    
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });
    
    employees.forEach((emp, index) => {
      const name = `${emp.firstName || 'Unknown'} ${emp.lastName || 'Unknown'}`;
      const phone = emp.phoneNumber || 'Not set';
      console.log(`${index + 1}. ${name} (${emp.email}) - ${phone}`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export functions
export { addSamplePhoneNumbers, showEmployeesWithPhoneNumbers };

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'add') {
    addSamplePhoneNumbers();
  } else if (command === 'show') {
    showEmployeesWithPhoneNumbers();
  } else {
    console.log('Usage:');
    console.log('  npx tsx src/lib/manualPhoneNumbers.ts add  # Add sample phone numbers');
    console.log('  npx tsx src/lib/manualPhoneNumbers.ts show # Show all employees');
  }
} 