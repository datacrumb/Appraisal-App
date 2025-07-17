"use client"

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface AppraisalFormProps {
  questions: { label: string; type: string }[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
}

const AppraisalForm: React.FC<AppraisalFormProps> = ({ questions, onSubmit }) => {
  const defaultValues = questions.reduce((acc, q, i) => {
    acc[`q${i + 1}`] = "";
    return acc;
  }, {} as Record<string, string>);

  const methods = useForm({ defaultValues });
  const { handleSubmit, reset } = methods;
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
    } catch (e) {
      // error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 px-10 py-10">
        {questions.map((question, idx) => (
          <FormField
            key={idx}
            name={`q${idx + 1}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.label}</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    className="w-full min-h-[80px] border rounded-md p-2"
                    placeholder="Your answer..."
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default AppraisalForm;