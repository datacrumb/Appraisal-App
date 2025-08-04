import { clearMockData } from './clearMockData';

async function main() {
  console.log('🚀 Starting mock data clearing process...');
  
  try {
    await clearMockData();
    console.log('🎉 Mock data clearing completed successfully!');
  } catch (error) {
    console.error('💥 Mock data clearing failed:', error);
    process.exit(1);
  }
}

main(); 