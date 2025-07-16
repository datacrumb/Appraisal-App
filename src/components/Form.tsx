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

const questions = [
  "What are this employee’s top strengths?",
  "Where can this employee improve?",
  "How well does the employee communicate with others?",
  "How effectively does the employee manage their responsibilities?",
  "Can you share an example of their impact on the team or project?",
  "How well do they take feedback?",
  "How would you rate their teamwork and collaboration skills?",
  "Any additional feedback you’d like to share?",
];

const defaultValues = questions.reduce((acc, q, i) => {
  acc[`q${i + 1}`] = "";
  return acc;
}, {} as Record<string, string>);

const AppraisalForm = () => {
  const methods = useForm({ defaultValues });
  const { handleSubmit, reset } = methods;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      // Prepare the payload for the API
      const payload = {
        title: "Appraisal Form",
        description: "Annual employee appraisal form.",
        questions: questions.map((q, i) => ({
          type: "text",
          label: q,
          answer: data[`q${i + 1}`],
        })),
      };
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit form");
      }
      setSuccess("Form submitted successfully!");
      reset();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {questions.map((question, idx) => (
          <FormField
            key={idx}
            name={`q${idx + 1}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question}</FormLabel>
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
        {success && <div className="text-green-600 text-center">{success}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </FormProvider>
  );
};

export default AppraisalForm;