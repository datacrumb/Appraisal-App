"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Save, Edit, Trash2, Users, UserCheck } from "lucide-react";

interface Form {
  id: string;
  title: string;
  description?: string;
  questions: { label: string; type: string }[];
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [{ label: "", type: "text" }]
  });

  const managerForm = forms.find(f => f.id === "manager-form");
  const employeeForm = forms.find(f => f.id === "employee-form");

  const handleCreateForm = async (type: "manager" | "employee") => {
    setLoading(true);
    try {
      const defaultQuestions = type === "manager" 
        ? [
            { label: "What are your key achievements this quarter?", type: "text" },
            { label: "What challenges did you face and how did you overcome them?", type: "text" },
            { label: "How do you support your team members?", type: "text" },
            { label: "What are your goals for the next quarter?", type: "text" },
            { label: "Additional comments or feedback:", type: "text" }
          ]
        : [
            { label: "Describe your main responsibilities and achievements:", type: "text" },
            { label: "What skills have you developed or improved?", type: "text" },
            { label: "How do you collaborate with your team?", type: "text" },
            { label: "What areas would you like to improve?", type: "text" },
            { label: "Any additional comments:", type: "text" }
          ];

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: type === "manager" ? "manager-form" : "employee-form",
          title: type === "manager" ? "Manager Assessment Form" : "Employee Performance Form",
          description: type === "manager" 
            ? "Form for manager evaluations" 
            : "Form for employee performance reviews",
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
      questions: Array.isArray(form.questions) ? form.questions : [{ label: "", type: "text" }]
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
      questions: [{ label: "", type: "text" }]
    });
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: Array.isArray(prev.questions) ? [...prev.questions, { label: "", type: "text" }] : [{ label: "", type: "text" }]
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: Array.isArray(prev.questions) ? prev.questions.filter((_, i) => i !== index) : [{ label: "", type: "text" }]
    }));
  };

  const updateQuestion = (index: number, field: "label" | "type", value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: Array.isArray(prev.questions) ? prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      ) : [{ label: "", type: "text" }]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Forms Management</h2>
        <div className="flex gap-2">
          {!managerForm && (
            <Button 
              onClick={() => handleCreateForm("manager")} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Manager Form
            </Button>
          )}
          {!employeeForm && (
            <Button 
              onClick={() => handleCreateForm("employee")} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Employee Form
            </Button>
          )}
        </div>
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
              Form for evaluating manager performance and leadership
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
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Question label"
                              value={question.label}
                              onChange={(e) => updateQuestion(index, "label", e.target.value)}
                            />
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
                    <div className="space-y-2">
                      {Array.isArray(managerForm.questions) ? managerForm.questions.map((q, i) => (
                        <div key={i} className="text-sm text-gray-700">
                          {i + 1}. {q.label}
                        </div>
                      )) : (
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
              Form for evaluating employee performance and development
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
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Question label"
                              value={question.label}
                              onChange={(e) => updateQuestion(index, "label", e.target.value)}
                            />
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
                    <div className="space-y-2">
                      {Array.isArray(employeeForm.questions) ? employeeForm.questions.map((q, i) => (
                        <div key={i} className="text-sm text-gray-700">
                          {i + 1}. {q.label}
                        </div>
                      )) : (
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