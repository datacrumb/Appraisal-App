"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AppraisalForm from "@/components/Form";

// Define the question structure for onboarding
interface OnboardingQuestion {
  id: string;
  label: string;
  type: "rating" | "multiple-choice" | "text" | "select" | "tel" | "file";
  options?: string[];
  section: string;
  optional?: boolean;
}

// Static departments
const departments = [
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

// Static roles
const roles = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Team Lead",
  "Manager",
  "Sales Representative",
  "Marketing Specialist",
  "Operations Manager",
  "Financial Analyst",
  "HR Specialist",
  "Technical Director",
  "CEO",
  "CTO",
  "CFO",
];

export function OnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [managers, setManagers] = useState<Array<{userId: string, name: string}>>([]);
  const [leads, setLeads] = useState<Array<{userId: string, name: string}>>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  
  // Check if user has already submitted
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.hasSubmitted) {
            setHasSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
      }
    };
    
    checkSubmissionStatus();
  }, []);

  // Fetch managers and leads on component mount
  useEffect(() => {
    const fetchManagersAndLeads = async () => {
      try {
        const managersResponse = await fetch("/api/managers");
        if (managersResponse.ok) {
          const managersData = await managersResponse.json();
          setManagers(managersData.managers);
        }
        
        const leadsResponse = await fetch("/api/leads");
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          setLeads(leadsData.leads);
        }
      } catch (error) {
        console.error("Error fetching managers and leads:", error);
      }
    };
    
    fetchManagersAndLeads();
  }, []);

  // Fetch managers when department changes
  const handleDepartmentChange = async (department: string) => {
    setSelectedDepartment(department);
    
    if (department) {
      try {
        const response = await fetch(`/api/managers?department=${department}`);
        if (response.ok) {
          const data = await response.json();
          setManagers(data.managers);
        }
      } catch (error) {
        console.error("Error fetching managers for department:", error);
      }
    }
  };

  const onSubmit = async (answers: Record<string, string | File>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('department', answers.department as string);
      formData.append('role', answers.role as string);
      formData.append('phoneNumber', (answers.phoneNumber as string) || '');
      formData.append('isManager', (answers.isManager as string) || 'false');
      formData.append('isLead', (answers.isLead as string) || 'false');
      formData.append('manager', (answers.manager as string) || '');
      formData.append('lead', (answers.lead as string) || '');
      
      // Handle profile picture file upload
      if (answers.profilePicture && answers.profilePicture instanceof File) {
        formData.append('profilePicture', answers.profilePicture);
      }

      const response = await fetch("/api/onboarding", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to submit onboarding form");
      
      setHasSubmitted(true);
      toast.success("Onboarding form submitted successfully!");
    } catch (error) {
      toast.error("An error occurred while submitting the form.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 dark:text-green-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Form Submitted Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your onboarding request has been submitted and is waiting for admin approval.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          You will be able to access the application once an administrator approves your request.
        </p>
      </div>
    );
  }

  // Create onboarding questions using the same structure as assignment forms
  const onboardingQuestions: OnboardingQuestion[] = [
    {
      id: "department",
      label: "What department do you work in?",
      type: "select",
      options: departments,
      section: "Basic Information"
    },
    {
      id: "role",
      label: "What is your role?",
      type: "select",
      options: roles,
      section: "Basic Information"
    },
    {
      id: "profilePicture",
      label: "Upload your profile picture",
      type: "file",
      section: "Contact Information"
    },
    {
      id: "phoneNumber",
      label: "What is your phone number?",
      type: "tel",
      section: "Contact Information"
    },
    {
      id: "isManager",
      label: "Are you a Manager?",
      type: "select",
      options: ["Yes", "No"],
      section: "Leadership"
    },
    {
      id: "isLead",
      label: "Are you a Team Lead?",
      type: "select",
      options: ["Yes", "No"],
      section: "Leadership"
    },
    {
      id: "manager",
      label: "Who is your manager? (Optional)",
      type: "select",
      options: ["None", ...managers.map(m => m.name)],
      section: "Reporting",
      optional: true
    },
    {
      id: "lead",
      label: "Who is your lead? (Optional)",
      type: "select",
      options: ["None", ...leads.map(l => l.name)],
      section: "Reporting",
      optional: true
    }
  ];

  return (
    <AppraisalForm
      questions={onboardingQuestions}
      formTitle="Employee Onboarding"
      formDescription="Please provide your basic information to complete your onboarding process. This information will help us set up your account and assign you to the appropriate teams and projects."
      onSubmit={onSubmit}
    />
  );
}
