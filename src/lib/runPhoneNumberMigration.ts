import { addPhoneNumbers, updateEmployeesWithSamplePhones } from './addPhoneNumbers';

async function runMigration() {
  console.log('🚀 Starting phone number migration...');
  
  try {
    // First, show all employees without phone numbers
    await addPhoneNumbers();
    
    console.log('\n📞 To add sample phone numbers to all employees, uncomment the line below in addPhoneNumbers.ts:');
    console.log('// await updateEmployeesWithSamplePhones();');
    
    console.log('\n🔧 To run the database migration:');
    console.log('npx prisma migrate dev --name add_phone_numbers');
    
    console.log('\n📊 To view/edit data in Prisma Studio:');
    console.log('npx prisma studio');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

// Run the migration script
runMigration(); 