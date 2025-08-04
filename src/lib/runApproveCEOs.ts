import { approveCEOs } from './approveCEOs';

async function main() {
  console.log('🚀 Starting CEO approval process...');
  
  try {
    await approveCEOs();
    console.log('🎉 CEO approval completed successfully!');
  } catch (error) {
    console.error('💥 CEO approval failed:', error);
    process.exit(1);
  }
}

main(); 