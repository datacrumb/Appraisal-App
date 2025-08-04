"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface EmployeeData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  role: string | null;
  isManager: boolean;
  isLead: boolean;
  profilePictureUrl: string | null;
}

export function useEmployee() {
  const { user, isLoaded } = useUser();
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmployeeStatus = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/employees/me');
        if (response.ok) {
          const data = await response.json();
          setIsEmployee(true);
          setEmployeeData(data);
        } else {
          setIsEmployee(false);
          setEmployeeData(null);
        }
      } catch (error) {
        console.error('Error checking employee status:', error);
        setIsEmployee(false);
        setEmployeeData(null);
      } finally {
        setLoading(false);
      }
    };

    checkEmployeeStatus();
  }, [isLoaded, user]);

  return {
    isEmployee,
    employeeData,
    loading: loading || !isLoaded
  };
} 