import { NextResponse } from "next/server";
import { fetchDepartments } from "@/lib/sheets";

export async function GET() {
  try {
    const defaultDepartments = [
        "Executive",
        "Engineering",
        "Product", 
        "Design",
        "Sales",
        "Marketing",
        "Operations",
        "Finance",
        "HR"
      ];
      return NextResponse.json({ departments: defaultDepartments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
