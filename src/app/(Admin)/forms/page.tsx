import { FormsManagement } from "@/components/admin/FormsManagement";
import { prisma } from "@/lib/prsima";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { redirect } from "next/navigation";

export default async function FormsPage() {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    redirect("/");
  }

  // Fetch existing forms
  const forms = await prisma.form.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Transform forms to match the Form interface
  const transformedForms = forms.map(form => ({
    id: form.id,
    title: form.title,
    description: form.description || undefined,
    questions: Array.isArray(form.questions) 
      ? (form.questions as { label: string; type: string }[])
      : [],
    createdAt: form.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto p-4">
      <FormsManagement initialForms={transformedForms} />
    </div>
  );
} 