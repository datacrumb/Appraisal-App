"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const formSchema = z.object({
  department: z.string().min(1, "Department is required"),
  role: z.string().min(1, "Role is required"),
  isManager: z.boolean(),
  isLead: z.boolean(),
  manager: z.string().optional(), // Make it optional
  profilePicture: z.instanceof(File).optional(),
});

const roles = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Team Lead",
  "Manager",
];

export function OnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [managers, setManagers] = useState<Array<{userId: string, name: string}>>([]);
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

  // Fetch departments and managers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, managersResponse] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/managers")
        ]);
        
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          console.log("Department data received:", deptData);
          setDepartments(deptData.departments);
        }
        
        if (managersResponse.ok) {
          const managersData = await managersResponse.json();
          setManagers(managersData.managers);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: "",
      role: "",
      isManager: false,
      isLead: false,
      manager: "",
    },
  });

  // Fetch managers when department changes
  const handleDepartmentChange = async (department: string) => {
    setSelectedDepartment(department);
    form.setValue("department", department);
    
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('department', values.department);
      formData.append('role', values.role);
      formData.append('isManager', values.isManager.toString());
      formData.append('isLead', values.isLead.toString());
      
      // Handle manager assignment logic
      let managerValue = values.manager || '';
      
      formData.append('manager', managerValue);
      
      if (values.profilePicture) {
        formData.append('profilePicture', values.profilePicture);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={(value) => handleDepartmentChange(value)} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isManager"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Are you a Manager?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isLead"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Are you a Team Lead?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="manager"
          render={({ field }) => {
            const selectedRole = form.watch('role');
            const isCEOOrAdmin = selectedRole?.toLowerCase().includes('ceo') || 
                                selectedRole?.toLowerCase().includes('admin');
            
            // Only show manager field if a role is selected and it's not CEO/Admin
            const shouldShowManager = selectedRole && !isCEOOrAdmin && managers.length > 0;
            
            return (
              <FormItem>
                <FormLabel>
                  Manager/Lead 
                  {isCEOOrAdmin && " (Not required for CEO/Admin)"}
                </FormLabel>
                {shouldShowManager ? (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your manager or lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem key={manager.userId} value={manager.userId}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {!selectedRole 
                      ? "Please select a role first"
                      : isCEOOrAdmin 
                        ? "CEO/Admin positions do not require a manager."
                        : "No managers available for this department."
                    }
                  </div>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="profilePicture"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file);
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
