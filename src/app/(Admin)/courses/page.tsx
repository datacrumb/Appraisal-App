import { CourseManagement } from "@/components/admin/CourseManagement";
import { prisma } from "@/lib/prsima";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { redirect } from "next/navigation";

export default async function CoursesPage() {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    redirect("/");
  }

  // Fetch all courses
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employeeCourses: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      }
    }
  });

  // Fetch all employees for assignment
  const employees = await prisma.employee.findMany({
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
    }
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Course Management</h1>
      <CourseManagement 
        initialCourses={courses}
        allEmployees={employees}
      />
    </div>
  );
}
