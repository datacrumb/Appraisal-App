"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Save, Edit, Trash2, Users, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Question {
  id: string;
  label: string;
  type: "rating" | "multiple-choice" | "text";
  options?: string[];
  section: string;
}

interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
}

interface FormsManagementProps {
  initialForms: Form[];
}

export function FormsManagement({ initialForms }: FormsManagementProps) {
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [editingForm, setEditingForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    questions: Question[];
  }>({
    title: "",
    description: "",
    questions: [{ id: "", label: "", type: "text", section: "" }]
  });

  const managerForm = forms.find(f => f.id === "manager-form");
  const employeeForm = forms.find(f => f.id === "employee-form");

  // Default comprehensive questions for employee evaluation
  const getDefaultEmployeeQuestions = (): Question[] => [
    // Section 1: Work Quality & Execution
    {
      id: "work_quality_1",
      label: "How would you rate the overall quality of this employee's work?",
      type: "rating",
      section: "Work Quality & Execution",
    },
    {
      id: "work_quality_2",
      label: "Does the employee consistently meet deadlines and manage time effectively?",
      type: "rating",
      section: "Work Quality & Execution",
    },
    {
      id: "work_quality_3",
      label: "How detail-oriented is the employee in their tasks and deliverables?",
      type: "rating",
      section: "Work Quality & Execution",
    },
    {
      id: "work_quality_4",
      label: "How well does the employee follow project guidelines and instructions?",
      type: "rating",
      section: "Work Quality & Execution",
    },
    {
      id: "work_quality_5",
      label: "Any specific example where the employee demonstrated exceptional quality?",
      type: "text",
      section: "Work Quality & Execution",
    },
    // Section 2: Collaboration & Communication
    {
      id: "collaboration_1",
      label: "How effectively does the employee communicate with peers and supervisors?",
      type: "rating",
      section: "Collaboration & Communication",
    },
    {
      id: "collaboration_2",
      label: "Is the employee receptive to feedback and willing to make improvements?",
      type: "rating",
      section: "Collaboration & Communication",
    },
    {
      id: "collaboration_3",
      label: "How well does the employee work in a team setting?",
      type: "rating",
      section: "Collaboration & Communication",
    },
    {
      id: "collaboration_4",
      label: "Does the employee show respect and professionalism in their interactions?",
      type: "rating",
      section: "Collaboration & Communication",
    },
    {
      id: "collaboration_5",
      label: "Any feedback regarding the employee's interpersonal skills?",
      type: "text",
      section: "Collaboration & Communication",
    },
    // Section 3: Ownership & Initiative
    {
      id: "ownership_1",
      label: "How proactive is the employee in taking on new tasks or challenges?",
      type: "rating",
      section: "Ownership & Initiative",
    },
    {
      id: "ownership_2",
      label: "Does the employee take responsibility for their work and outcomes?",
      type: "rating",
      section: "Ownership & Initiative",
    },
    {
      id: "ownership_3",
      label: "How would you rate the employee's ability to work independently?",
      type: "rating",
      section: "Ownership & Initiative",
    },
    {
      id: "ownership_4",
      label: "Have they ever proposed new ideas or improvements?",
      type: "rating",
      section: "Ownership & Initiative",
    },
    {
      id: "ownership_5",
      label: "Describe a moment where the employee showed strong ownership.",
      type: "text",
      section: "Ownership & Initiative",
    },
    // Section 4: Growth & Potential
    {
      id: "growth_1",
      label: "How open is the employee to learning and self-improvement?",
      type: "rating",
      section: "Growth & Potential",
    },
    {
      id: "growth_2",
      label: "Has the employee shown growth since their last evaluation (if applicable)?",
      type: "rating",
      section: "Growth & Potential",
    },
    {
      id: "growth_3",
      label: "Would you trust the employee with more responsibilities or a leadership role?",
      type: "rating",
      section: "Growth & Potential",
    },
    {
      id: "growth_4",
      label: "What specific skills or areas should the employee focus on developing?",
      type: "text",
      section: "Growth & Potential",
    },
    {
      id: "growth_5",
      label: "Any other comments regarding the employee's future potential?",
      type: "text",
      section: "Growth & Potential",
    }
  ];

  // Default comprehensive questions for manager evaluation
  const getDefaultManagerQuestions = (): Question[] => [
    // Section 1: Leadership & Management
    {
      id: "leadership_1",
      label: "How effectively does the manager lead and guide their team?",
      type: "rating",
      section: "Leadership & Management",
    },
    {
      id: "leadership_2",
      label: "Does the manager provide clear direction and expectations?",
      type: "rating",
      section: "Leadership & Management",
    },
    {
      id: "leadership_3",
      label: "How well does the manager support team member development?",
      type: "rating",
      section: "Leadership & Management",
    },
    {
      id: "leadership_4",
      label: "Does the manager handle conflicts and challenges effectively?",
      type: "rating",
      section: "Leadership & Management",
    },
    {
      id: "leadership_5",
      label: "Describe a specific example of the manager's leadership effectiveness.",
      type: "text",
      section: "Leadership & Management",
    },
    // Section 2: Communication & Feedback
    {
      id: "communication_1",
      label: "How clearly does the manager communicate goals and expectations?",
      type: "rating",
      section: "Communication & Feedback",
    },
    {
      id: "communication_2",
      label: "Does the manager provide regular and constructive feedback?",
      type: "rating",
      section: "Communication & Feedback",
    },
    {
      id: "communication_3",
      label: "How accessible is the manager to team members?",
      type: "rating",
      section: "Communication & Feedback",
    },
    {
      id: "communication_4",
      label: "Does the manager listen to and consider team input?",
      type: "rating",
      section: "Communication & Feedback",
    },
    {
      id: "communication_5",
      label: "Any feedback regarding the manager's communication style?",
      type: "text",
      section: "Communication & Feedback",
    },
    // Section 3: Team Development
    {
      id: "team_dev_1",
      label: "How well does the manager foster a positive team environment?",
      type: "rating",
      section: "Team Development",
    },
    {
      id: "team_dev_2",
      label: "Does the manager encourage collaboration and teamwork?",
      type: "rating",
      section: "Team Development",
    },
    {
      id: "team_dev_3",
      label: "How effectively does the manager recognize and reward team achievements?",
      type: "rating",
      section: "Team Development",
    },
    {
      id: "team_dev_4",
      label: "Does the manager promote professional growth opportunities?",
      type: "rating",
      section: "Team Development",
    },
    {
      id: "team_dev_5",
      label: "Describe how the manager contributes to team success.",
      type: "text",
      section: "Team Development",
    },
    // Section 4: Strategic Thinking
    {
      id: "strategic_1",
      label: "How well does the manager align team goals with organizational objectives?",
      type: "rating",
      section: "Strategic Thinking",
    },
    {
      id: "strategic_2",
      label: "Does the manager demonstrate forward-thinking and planning?",
      type: "rating",
      section: "Strategic Thinking",
    },
    {
      id: "strategic_3",
      label: "How effectively does the manager handle resource allocation?",
      type: "rating",
      section: "Strategic Thinking",
    },
    {
      id: "strategic_4",
      label: "What areas could the manager improve in strategic planning?",
      type: "text",
      section: "Strategic Thinking",
    },
    {
      id: "strategic_5",
      label: "Any additional comments about the manager's strategic capabilities?",
      type: "text",
      section: "Strategic Thinking",
    }
  ];

  const handleCreateForm = async (type: "manager" | "employee") => {
    setLoading(true);
    try {
      const defaultQuestions = type === "manager" 
        ? getDefaultManagerQuestions()
        : getDefaultEmployeeQuestions();

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: type === "manager" ? "manager-form" : "employee-form",
          title: type === "manager" ? "Manager Assessment Form" : "Employee Performance Form",
          description: type === "manager" 
            ? "Comprehensive evaluation form for manager performance and leadership" 
            : "Comprehensive evaluation form for employee performance and development",
          questions: defaultQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create form");
      }

      const newForm = await response.json();
      setForms(prev => [...prev, newForm]);
      toast.success(`${type === "manager" ? "Manager" : "Employee"} form created successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  const handleEditForm = (form: Form) => {
    setEditingForm(form.id);
    setFormData({
      title: form.title,
      description: form.description || "",
      questions: Array.isArray(form.questions) ? form.questions : [{ id: "", label: "", type: "text", section: "" }]
    });
  };

  const handleSaveForm = async (formId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update form");
      }

      const updatedForm = await response.json();
      setForms(prev => prev.map(f => f.id === formId ? updatedForm : f));
      setEditingForm(null);
      toast.success("Form updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update form");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingForm(null);
    setFormData({
      title: "",
      description: "",
      questions: [{ id: "", label: "", type: "text", section: "" }]
    });
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: Array.isArray(prev.questions) ? [...prev.questions, { id: "", label: "", type: "text", section: "" }] : [{ id: "", label: "", type: "text", section: "" }]
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: Array.isArray(prev.questions) ? prev.questions.filter((_, i) => i !== index) : [{ id: "", label: "", type: "text", section: "" }]
    }));
  };

  const updateQuestion = (index: number, field: "id" | "label" | "type" | "section", value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: Array.isArray(prev.questions) ? prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      ) : [{ id: "", label: "", type: "text", section: "" }]
    }));
  };

  const handleUpdateFormsWithNewQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/forms/update-default-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to update forms");
      }

      const result = await response.json();
      
      // Refresh the forms list
      const formsResponse = await fetch("/api/forms");
      if (formsResponse.ok) {
        const updatedForms = await formsResponse.json();
        setForms(updatedForms);
      }

      toast.success("Forms updated with new comprehensive questions!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update forms");
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionPreview = (question: Question, index: number) => (
    <div key={question.id} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-xs text-gray-500">{question.section}</span>
      </div>
      <div className="font-medium">{question.label}</div>
      <div className="text-xs text-gray-500 mt-1">
        Type: {question.type} {question.options && `(${question.options.length} options)`}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:justify-between items-center">
        <h2 className="text-2xl font-bold">Forms Management</h2>
        <Button 
          onClick={handleUpdateFormsWithNewQuestions}
          disabled={loading}
          variant="outline"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Update Forms with New Questions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manager Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Manager Assessment Form
            </CardTitle>
            <CardDescription>
              Comprehensive evaluation form for manager performance and leadership
            </CardDescription>
          </CardHeader>
          <CardContent>
            {managerForm ? (
              <div className="space-y-4">
                {editingForm === managerForm.id ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Form title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Form description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Questions</h4>
                        <Button size="sm" onClick={addQuestion}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Question
                        </Button>
                      </div>
                      
                      {Array.isArray(formData.questions) ? formData.questions.map((question, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Question ID"
                              value={question.id}
                              onChange={(e) => updateQuestion(index, "id", e.target.value)}
                            />
                            <Input
                              placeholder="Section"
                              value={question.section}
                              onChange={(e) => updateQuestion(index, "section", e.target.value)}
                            />
                          </div>
                          <Input
                            placeholder="Question label"
                            value={question.label}
                            onChange={(e) => updateQuestion(index, "label", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Select onValueChange={(value) => updateQuestion(index, "type", value)}>
                              <SelectTrigger className="border rounded p-2">
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="rating">Rating</SelectItem>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeQuestion(index)}
                            disabled={formData.questions.length === 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )) : (
                        <div className="text-sm text-gray-500 italic">No questions available</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleSaveForm(managerForm.id)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{managerForm.title}</h4>
                      <p className="text-sm text-gray-600">{managerForm.description}</p>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {Array.isArray(managerForm.questions) ? managerForm.questions.map((q, i) => renderQuestionPreview(q, i)) : (
                        <div className="text-sm text-gray-500 italic">No questions configured</div>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleEditForm(managerForm)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Form
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No manager form created yet</p>
                <Button 
                  onClick={() => handleCreateForm("manager")}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Manager Form
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Employee Performance Form
            </CardTitle>
            <CardDescription>
              Comprehensive evaluation form for employee performance and development
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employeeForm ? (
              <div className="space-y-4">
                {editingForm === employeeForm.id ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Form title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Form description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Questions</h4>
                        <Button size="sm" onClick={addQuestion}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Question
                        </Button>
                      </div>
                      
                      {Array.isArray(formData.questions) ? formData.questions.map((question, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Question ID"
                              value={question.id}
                              onChange={(e) => updateQuestion(index, "id", e.target.value)}
                            />
                            <Input
                              placeholder="Section"
                              value={question.section}
                              onChange={(e) => updateQuestion(index, "section", e.target.value)}
                            />
                          </div>
                          <Input
                            placeholder="Question label"
                            value={question.label}
                            onChange={(e) => updateQuestion(index, "label", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Select onValueChange={(value) => updateQuestion(index, "type", value)}>
                              <SelectTrigger className="border rounded p-2">
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="rating">Rating</SelectItem>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeQuestion(index)}
                            disabled={formData.questions.length === 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )) : (
                        <div className="text-sm text-gray-500 italic">No questions available</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleSaveForm(employeeForm.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{employeeForm.title}</h4>
                      <p className="text-sm text-gray-600">{employeeForm.description}</p>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {Array.isArray(employeeForm.questions) ? employeeForm.questions.map((q, i) => renderQuestionPreview(q, i)) : (
                        <div className="text-sm text-gray-500 italic">No questions configured</div>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleEditForm(employeeForm)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Form
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No employee form created yet</p>
                <Button 
                  onClick={() => handleCreateForm("employee")}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Employee Form
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 