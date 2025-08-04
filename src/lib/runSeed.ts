import { seedMockUsers } from './seedMockUsers';

async function main() {
  console.log('🚀 Starting mock user seeding...');
  
  try {
    await seedMockUsers();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

main(); 