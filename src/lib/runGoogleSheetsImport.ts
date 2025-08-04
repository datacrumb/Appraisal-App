import { importFromGoogleSheets } from './importFromGoogleSheets';

async function main() {
  console.log('🚀 Starting Google Sheets import process...');
  
  try {
    await importFromGoogleSheets();
    console.log('🎉 Google Sheets import completed successfully!');
  } catch (error) {
    console.error('💥 Google Sheets import failed:', error);
    process.exit(1);
  }
}

main(); 