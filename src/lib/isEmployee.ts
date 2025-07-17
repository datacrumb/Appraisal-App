import { clerkClient } from "@clerk/nextjs/server";

export async function isEmployee(userId: string | null) {
    if (!userId) return false;
  
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      return user.publicMetadata.role === "employee";
    } catch (error) {
      console.error("Error checking employee status:", error);
      return false;
    }
  }