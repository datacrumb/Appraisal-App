import { generateMockData } from './generateMockData';

async function main() {
  console.log('🚀 Starting GASCO mock data generation...');
  
  try {
    await generateMockData();
    console.log('🎉 GASCO mock data generation completed successfully!');
  } catch (error) {
    console.error('💥 GASCO mock data generation failed:', error);
    process.exit(1);
  }
}

main(); 