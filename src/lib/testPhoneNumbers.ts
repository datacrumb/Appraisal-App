import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function testPhoneNumbers() {
  try {
    console.log('🔍 Testing phone numbers in database...');
    
    // Get all employees with phone numbers
    const employeesWithPhones = await prisma.employee.findMany({
      where: {
        phoneNumber: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });
    
    console.log(`✅ Found ${employeesWithPhones.length} employees WITH phone numbers:`);
    employeesWithPhones.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName || 'Unknown'} ${emp.lastName || 'Unknown'} (${emp.email})`);
      console.log(`   Phone: ${emp.phoneNumber}`);
    });
    
    // Get employees without phone numbers
    const employeesWithoutPhones = await prisma.employee.findMany({
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
    
    console.log(`\n❌ Found ${employeesWithoutPhones.length} employees WITHOUT phone numbers:`);
    employeesWithoutPhones.slice(0, 5).forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName || 'Unknown'} ${emp.lastName || 'Unknown'} (${emp.email})`);
    });
    
    if (employeesWithoutPhones.length > 5) {
      console.log(`... and ${employeesWithoutPhones.length - 5} more`);
    }
    
    // Test specific user (replace with your user ID)
    console.log('\n🔍 Testing specific user profile...');
    const testUserId = 'user_30E3xCvug2JLFCZEfdfEyExLlu'; // Replace with your actual user ID
    const testUser = await prisma.employee.findUnique({
      where: { id: testUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
      }
    });
    
    if (testUser) {
      console.log(`Test user: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
      console.log(`Phone: ${testUser.phoneNumber || 'NULL'}`);
    } else {
      console.log('Test user not found in Employee table');
    }
    
  } catch (error) {
    console.error('❌ Error testing phone numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPhoneNumbers(); 