import { prisma } from "./prsima";

export async function isEmployee(userId: string | null) {
  if (!userId) return false;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    return !!employee;
  } catch (error) {
    console.error("Error checking employee status:", error);
    return false;
  }
}

export async function getEmployeeData(userId: string | null) {
  if (!userId) return null;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        isManager: true,
        isLead: true,
        profilePictureUrl: true
      }
    });
    
    return employee;
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return null;
  }
} 