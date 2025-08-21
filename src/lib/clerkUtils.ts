import { clerkClient } from "@clerk/nextjs/server";

export async function updateClerkProfilePicture(userId: string, imageUrl: string) {
  try {
    // Fetch the image and convert to Blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Update the user's profile image in Clerk
    const client = await clerkClient();
    await client.users.updateUserProfileImage(userId, { file: blob });
    
    console.log(`✅ Successfully updated Clerk profile picture for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update Clerk profile picture for user ${userId}:`, error);
    return false;
  }
}
