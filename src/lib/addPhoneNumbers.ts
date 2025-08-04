import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function addPhoneNumbers() {
  try {
    console.log('Fetching all employees...');
    
    // Get all employees without phone numbers
    const employees = await prisma.employee.findMany({
      where: {
        phoneNumber: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true
      }
    });

    console.log(`Found ${employees.length} employees without phone numbers:`);
    
    employees.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.firstName || 'Unknown'} ${employee.lastName || 'Unknown'} (${employee.email})`);
      console.log(`   Department: ${employee.department || 'Unknown'}`);
      console.log(`   Role: ${employee.role || 'Unknown'}`);
      console.log('---');
    });

    console.log('\nTo add phone numbers, you can:');
    console.log('1. Use Prisma Studio: npx prisma studio');
    console.log('2. Update them programmatically using the script below');
    console.log('3. Use the API endpoint to update individual employees');
    
    console.log('\nExample phone numbers format:');
    console.log('- +1 (555) 123-4567');
    console.log('- +44 20 7946 0958');
    console.log('- +61 2 8765 4321');
    
    console.log('\nSample data for testing:');
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
      '+1 (555) 012-3456'
    ];

    console.log('\nTo update employees with sample phone numbers, run:');
    console.log('await updateEmployeesWithSamplePhones();');
    
    // Uncomment the line below to automatically assign sample phone numbers
    await updateEmployeesWithSamplePhones();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateEmployeesWithSamplePhones() {
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
    '+1 (555) 012-3456'
  ];

  const employees = await prisma.employee.findMany({
    where: {
      phoneNumber: null
    }
  });

  console.log(`Updating ${employees.length} employees with sample phone numbers...`);

  for (let i = 0; i < employees.length; i++) {
    const phoneNumber = samplePhoneNumbers[i % samplePhoneNumbers.length];
    
    await prisma.employee.update({
      where: { id: employees[i].id },
      data: { phoneNumber }
    });
    
    console.log(`Updated ${employees[i].email} with phone: ${phoneNumber}`);
  }

  console.log('All employees updated with sample phone numbers!');
}

async function updateSpecificEmployee(employeeId: string, phoneNumber: string) {
  try {
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { phoneNumber }
    });
    
    console.log(`Updated ${employee.email} with phone: ${phoneNumber}`);
    return employee;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

// Export functions for use in other scripts
export { addPhoneNumbers, updateEmployeesWithSamplePhones, updateSpecificEmployee };

// Run the script if called directly
if (require.main === module) {
  addPhoneNumbers();
} 