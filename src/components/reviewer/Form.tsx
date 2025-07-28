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
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface Question {
  id: string;
  label: string;
  type: "rating" | "multiple-choice" | "text";
  options?: string[];
  section: string;
  sectionColor: string;
}

interface AppraisalFormProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  formTitle?: string;
  formDescription?: string;
}

const AppraisalForm: React.FC<AppraisalFormProps> = ({
  questions,
  onSubmit,
  formTitle = "Employee Performance Evaluation",
  formDescription = "Please provide honest and constructive feedback about the employee's performance. Your responses will help in their professional development and growth."
}) => {
  const defaultValues = questions.reduce((acc, q) => {
    acc[q.id] = "";
    return acc;
  }, {} as Record<string, string>);

  const methods = useForm({ defaultValues });
  const { handleSubmit, reset, watch } = methods;
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // Group questions by section
  const sections = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = {
        name: question.section,
        color: question.sectionColor,
        questions: []
      };
    }
    acc[question.section].questions.push(question);
    return acc;
  }, {} as Record<string, { name: string; color: string; questions: Question[] }>);

  const sectionNames = Object.keys(sections);
  const currentSectionName = sectionNames[currentSection];
  const currentSectionData = sections[currentSectionName];
  const watchedValues = watch();

  // Calculate progress
  const totalQuestions = questions.length;
  const answeredQuestions = Object.values(watchedValues).filter(value => value !== "").length;
  const progress = (answeredQuestions / totalQuestions) * 100;

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

  const nextSection = () => {
    if (currentSection < sectionNames.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderQuestion = (question: Question) => {
    return (
      <FormField
        key={question.id}
        name={question.id}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base font-medium text-gray-900">
              {question.label}
            </FormLabel>
            <FormControl>
              <div>
                {question.type === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={`${question.id}-rating-${rating}`}
                        type="button"
                        variant={field.value === rating.toString() ? "default" : "outline"}
                        className={`w-12 h-12 rounded-none ${field.value === rating.toString()
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                          }`}
                        onClick={() => field.onChange(rating.toString())}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                )}

                {question.type === "multiple-choice" && question.options && (
                  <div className="grid grid-cols-1 gap-2">
                    {question.options.map((option, index) => (
                      <Button
                        key={`${question.id}-option-${index}`}
                        type="button"
                        variant={field.value === option ? "default" : "outline"}
                        className={`justify-start h-auto p-3 rounded-none ${field.value === option
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                          }`}
                        onClick={() => field.onChange(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                {question.type === "text" && (
                  <textarea
                    {...field}
                    className="w-full min-h-[80px] border border-gray-300 rounded-md p-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Your answer..."
                    disabled={loading}
                  />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="bg-gray-50">
      <div className="flex">
        {/* Left side - Background image placeholder */}
        <div className="hidden lg:block lg:w-2/5 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
          <Image
            src="/images/FormPage.jpg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-3/5 bg-white">
          <div className="max-w-2xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {formTitle}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {formDescription}
              </p>
            </div>

            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentSectionData.color }}
                ></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Section {currentSection + 1}: {currentSectionData.name}
                </h2>
              </div>
            </div>

            <FormProvider {...methods}>
              <>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Current Section Questions */}
                  {currentSectionData.questions.map((question) => (
                    <div key={question.id}>
                      {renderQuestion(question)}
                    </div>
                  ))}

                  {/* Navigation */}
                  <div className="flex justify-end gap-2 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={previousSection}
                      disabled={currentSection === 0}
                      className="px-6 py-2 border-gray-300 text-gray-900 hover:bg-gray-50 rounded-none"
                    >
                      Previous
                    </Button>
                    
                    {currentSection < sectionNames.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextSection}
                        className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded-none"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded-none"
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </Button>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(progress)}% completed
                      </span>
                      <span className="text-sm text-gray-500">
                        {answeredQuestions} of {totalQuestions} questions
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </form>
              </>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppraisalForm;