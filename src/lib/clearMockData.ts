import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function clearMockData() {
  console.log('🧹 Starting to clear all mock data...');

  try {
    // Delete in correct order to respect foreign key constraints
    
    // 1. Clear responses first (they reference assignments)
    console.log('📝 Clearing responses...');
    const deletedResponses = await prisma.response.deleteMany();
    console.log(`✅ Deleted ${deletedResponses.count} responses`);

    // 2. Clear assignments (they reference employees and forms)
    console.log('📋 Clearing assignments...');
    const deletedAssignments = await prisma.assignment.deleteMany();
    console.log(`✅ Deleted ${deletedAssignments.count} assignments`);

    // 3. Clear forms
    console.log('📄 Clearing forms...');
    const deletedForms = await prisma.form.deleteMany();
    console.log(`✅ Deleted ${deletedForms.count} forms`);

    // 4. Clear employee relations (they reference employees)
    console.log('🔗 Clearing employee relations...');
    const deletedRelations = await prisma.employeeRelation.deleteMany();
    console.log(`✅ Deleted ${deletedRelations.count} relations`);

    // 5. Clear employees
    console.log('👥 Clearing all employees...');
    const deletedEmployees = await prisma.employee.deleteMany();
    console.log(`✅ Deleted ${deletedEmployees.count} employees`);

    // 6. Clear onboarding requests
    console.log('📋 Clearing onboarding requests...');
    const deletedOnboarding = await prisma.onboardingRequest.deleteMany();
    console.log(`✅ Deleted ${deletedOnboarding.count} onboarding requests`);

    console.log('🎉 All mock data cleared successfully!');
    console.log('📊 Database is now clean and ready for Google Sheets import.');

  } catch (error) {
    console.error('❌ Error clearing mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use
export { clearMockData };

// Run if called directly
if (require.main === module) {
  clearMockData()
    .then(() => {
      console.log('🎉 Mock data clearing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Mock data clearing failed:', error);
      process.exit(1);
    });
} 