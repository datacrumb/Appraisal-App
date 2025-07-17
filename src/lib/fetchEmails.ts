import { clerkClient } from "@clerk/nextjs/server";


export async function fetchUsers(userId: string) {
    const users = await (await clerkClient()).users.getUserList();
    const filtered = users.data.filter((u) => u.id !== userId).map((u) => ({
      id: u.id,
      email: u.emailAddresses?.[0]?.emailAddress || "",
    }));

    return filtered
}