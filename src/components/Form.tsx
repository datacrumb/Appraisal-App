"use client"

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface Question {
  id: string;
  label: string;
  type: "rating" | "multiple-choice" | "text" | "select" | "tel" | "file";
  options?: string[];
  section: string;
  optional?: boolean;
}

interface AppraisalFormProps {
  questions: Question[];
  onSubmit?: (answers: Record<string, string | File>) => Promise<void>;
  formTitle?: string;
  formDescription?: string;
  evaluationTarget?: {
    type: "MANAGER" | "EMPLOYEE" | "COLLEAGUE" | "LEAD" | "ADMIN";
    targetId: string;
    targetName: string;
    targetRole: string;
    targetDepartment: string;
  };
  // Read-only mode props
  readOnly?: boolean;
  defaultValues?: Record<string, string>;
  submittedAt?: string;
}

const AppraisalForm: React.FC<AppraisalFormProps> = ({
  questions,
  onSubmit,
  formTitle = "Employee Performance Evaluation",
  formDescription = "Evaluate the employees overall effectiveness in thier role, including the quality and consistency of their work, ability to meet deadlines, ownership of tasks, and contribution to team goals.",
  evaluationTarget,
  readOnly = false,
  defaultValues = {},
  submittedAt
}) => {
  // Create dynamic Zod schema based on questions
  const createValidationSchema = () => {
    const schemaFields: Record<string, z.ZodString | z.ZodOptional<z.ZodString> | z.ZodAny> = {};

    questions.forEach(question => {
      if (question.type === "file") {
        // File fields don't need validation in the schema
        schemaFields[question.id] = z.any();
      } else {
        let fieldSchema: z.ZodString | z.ZodOptional<z.ZodString>;
        
        if (question.optional) {
          fieldSchema = z.string().optional();
        } else {
          fieldSchema = z.string().min(1, `${question.label} is required`);
        }

        if (question.type === "rating") {
          fieldSchema = fieldSchema.refine(
            (val: string | undefined) => !val || ["1", "2", "3", "4", "5"].includes(val),
            { message: "Please select a rating between 1 and 5" }
          );
        } else if ((question.type === "multiple-choice" || question.type === "select") && question.options) {
          fieldSchema = fieldSchema.refine(
            (val: string | undefined) => !val || question.options!.includes(val),
            { message: `Please select one of the available options` }
          );
        } else if (question.type === "tel") {
          fieldSchema = fieldSchema.refine(
            (val: string | undefined) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/\s/g, '')),
            { message: "Please enter a valid phone number" }
          );
        }

        schemaFields[question.id] = fieldSchema;
      }
    });

    return z.object(schemaFields);
  };

  const validationSchema = createValidationSchema();
  type FormData = z.infer<typeof validationSchema> & Record<string, string | File | null>;

  const initialValues = readOnly ? defaultValues : questions.reduce((acc, q) => {
    acc[q.id] = q.type === "file" ? null : "";
    return acc;
  }, {} as Record<string, string | null>);

  const methods = useForm<FormData>({
    defaultValues: initialValues,
    resolver: zodResolver(validationSchema),
    mode: readOnly ? "onSubmit" : "onChange" // Only validate on submit in read-only mode
  });

  const { handleSubmit, reset, watch, formState: { errors, isValid } } = methods;
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // Group questions by section
  const sections = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = {
        name: question.section,
        questions: []
      };
    }
    acc[question.section].questions.push(question);
    return acc;
  }, {} as Record<string, { name: string; questions: Question[] }>);

  const sectionNames = Object.keys(sections);
  const currentSectionName = sectionNames[currentSection];
  const currentSectionData = sections[currentSectionName];
  const watchedValues = watch();

  // Calculate progress
  const requiredQuestions = questions.filter(q => !q.optional).length;
  const answeredRequiredQuestions = questions
    .filter(q => !q.optional)
    .filter(q => {
      const value = watchedValues[q.id];
      if (q.type === "file") {
        return value && value instanceof File;
      }
      return value && typeof value === 'string' && value.trim() !== '';
    })
    .length;
  const progress = requiredQuestions > 0 ? (answeredRequiredQuestions / requiredQuestions) * 100 : 100;

  // Check if current section is complete
  const isCurrentSectionComplete = () => {
    const currentQuestions = currentSectionData.questions;
    const currentAnswers = watch();

    return currentQuestions.every(question => {
      const answer = currentAnswers[question.id];
      
      // If question is optional, it's always considered complete
      if (question.optional) {
        return true;
      }
      
      // For required questions, check if they have valid answers
      if (question.type === "file") {
        return answer && answer instanceof File;
      }
      return answer && typeof answer === 'string' && answer.trim() !== '';
    });
  };

  // Check if all sections are complete
  const isFormComplete = () => {
    const allAnswers = watch();
    return questions.every(question => {
      const answer = allAnswers[question.id];
      
      // If question is optional, it's always considered complete
      if (question.optional) {
        return true;
      }
      
      // For required questions, check if they have valid answers
      if (question.type === "file") {
        return answer && answer instanceof File;
      }
      return answer && typeof answer === 'string' && answer.trim() !== '';
    });
  };

  // Check if current section is valid (no errors)
  const isCurrentSectionValid = () => {
    const currentQuestionIds = currentSectionData.questions.map(q => q.id);
    return !currentQuestionIds.some(id => errors[id]);
  };

  const handleFormSubmit = async (data: FormData) => {
    console.log('Form submission triggered with data:', data);
    if (readOnly || !onSubmit) return;
    
    setLoading(true);
    try {
      // Filter out undefined values for optional fields
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>;
      
      await onSubmit(cleanData);
      reset();
    } catch (e) {
      // error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    console.log('Next button clicked, current section:', currentSection);
    console.log('Is current section complete:', isCurrentSectionComplete());
    console.log('Is current section valid:', isCurrentSectionValid());
    
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
                        className={`w-12 h-12 rounded-none ${readOnly ? 'cursor-default' : 'hover:cursor-pointer'} ${field.value === rating.toString()
                          ? "bg-gray-900 text-white border-gray-900"
                          : readOnly 
                            ? "bg-gray-100 text-gray-400 border-gray-200"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                          }`}
                        onClick={readOnly ? undefined : () => field.onChange(rating.toString())}
                        disabled={readOnly}
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
                        className={`justify-start h-auto p-3 rounded-none ${readOnly ? 'cursor-default' : 'hover:cursor-pointer'} ${field.value === option
                          ? "bg-gray-900 text-white border-gray-900"
                          : readOnly 
                            ? "bg-gray-100 text-gray-400 border-gray-200"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                          }`}
                        onClick={readOnly ? undefined : () => field.onChange(option)}
                        disabled={readOnly}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                {question.type === "select" && question.options && (
                  <Select onValueChange={field.onChange} value={field.value} disabled={readOnly}>
                    <FormControl>
                      <SelectTrigger className={`rounded-none ${readOnly ? 'bg-gray-50 cursor-default' : ''}`}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {question.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {question.type === "tel" && (
                  <Input
                    {...field}
                    type="tel"
                    className={`rounded-none ${readOnly ? 'bg-gray-50 cursor-default' : ''}`}
                    placeholder={readOnly ? "No phone number provided" : "+1 (555) 123-4567"}
                    disabled={loading || readOnly}
                    readOnly={readOnly}
                  />
                )}

                {question.type === "text" && (
                  <textarea
                    {...field}
                    className={`w-full min-h-[80px] border border-gray-300 rounded-none p-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${readOnly ? 'bg-gray-50 cursor-default' : ''}`}
                    placeholder={readOnly ? "No answer provided" : "Your answer..."}
                    disabled={loading || readOnly}
                    readOnly={readOnly}
                  />
                )}

                {question.type === "file" && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                      className={`w-full p-2 border border-gray-300 rounded-none text-gray-900 ${readOnly ? 'bg-gray-50 cursor-default' : ''}`}
                      disabled={loading || readOnly}
                    />
                    {field.value && (
                      <div className="text-sm text-gray-600">
                        Selected: {field.value instanceof File ? field.value.name : field.value}
                      </div>
                    )}
                  </div>
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
        <div className="hidden md:block md:w-2/5 lg:w-2/5 relative">
          <Image
            src="/images/FormPage.jpg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        {/* Right side - Form */}
        <div className="relative w-full lg:w-3/5 bg-white overflow-hidden">

          {/* Background image - hidden on small devices */}
          <div className="absolute top-0 h-32" style={{ left: '-40%', width: '200%', height: '180px', backgroundImage: `url('/images/waves.png')`, backgroundPosition: 'center', backgroundSize: 'cover' }}/>

          <div className="max-w-2xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
                {evaluationTarget && (
                  <div className="flex items-center justify-between mb-5">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {evaluationTarget.targetName}
                    </h1>
                    <div className="flex space-x-2 text-3xl font-bold text-blue-500">
                      <p>{evaluationTarget.targetRole}</p>
                      <p>{evaluationTarget.targetDepartment}</p>
                    </div>
                  </div>
                )}
              <p className="text-black leading-relaxed">
                {readOnly ? `Submitted Response - ${formDescription}` : formDescription}
              </p>
              {readOnly && submittedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Submitted on: {new Date(submittedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
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

                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(progress)}% completed
                      </span>
                      <span className="text-sm text-gray-500">
                        {answeredRequiredQuestions} of {requiredQuestions} required questions
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 text-black" />
                  </div>
                </form>

                {/* Navigation - Outside the form to prevent submission */}
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
                      disabled={readOnly ? false : (!isCurrentSectionComplete() || !isCurrentSectionValid())}
                      className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded-none hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  ) : !readOnly ? (
                    <Button
                      type="button"
                      onClick={() => {
                        console.log('Submit button clicked');
                        handleSubmit(handleFormSubmit)();
                      }}
                      disabled={loading || !isValid}
                      className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  ) : null}
                </div>
              </>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
};  

export default AppraisalForm;