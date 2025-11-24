"use client";

import { useState, useEffect } from "react";
import { studentFormAPI, authAPI, tokenUtils } from "@/lib/api";

// Types for form steps
interface FormProgress {
  id: string;
  studentId: string;
  studentType?: string;
  inclusiveLearning?: string;
  formGender?: string;
  curriculum?: string;
  grade?: string;
  selectedCategories?: string; // JSON array of category IDs
  selectedSubcategories?: string; // JSON array of subcategory IDs
  preferredTime?: string;
  preferredTutor?: string;
  sessionType?: string;
  currentStep: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: FormProgress | Material[] | null;
}

interface Material {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  children?: Material[];
}

interface MultiStepStudentFormProps {
  onComplete?: () => void;
}

const MultiStepStudentForm: React.FC<MultiStepStudentFormProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormProgress | null>(null);
  const [categories, setCategories] = useState<Material[]>([]);
  const [subcategories, setSubcategories] = useState<Material[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form options based on backend enums
  const studentTypeOptions = [
    { value: "STUDENT", label: "Student" },
    { value: "PARENT", label: "Parent" },
  ];

  const inclusiveLearningOptions = [
    { value: "NONE", label: "None" },
    { value: "ADHD", label: "ADHD" },
    { value: "DYSLEXIA", label: "Dyslexia" },
    { value: "DYSCALCULIA", label: "Dyscalculia" },
    { value: "DYSGRAPHIA", label: "Dysgraphia" },
  ];

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ];

  const curriculumOptions = [
    { value: "IB_SYSTEM", label: "IB System" },
    { value: "AMERICAN_SYSTEM", label: "American System" },
    { value: "BRITISH_SYSTEM", label: "British System" },
    { value: "NATIONAL_SYSTEM", label: "National System" },
    { value: "FRENCH_SYSTEM", label: "French System" },
  ];

  const gradeOptions = [
    { value: "GRADE1", label: "Grade 1" },
    { value: "GRADE2", label: "Grade 2" },
    { value: "GRADE3", label: "Grade 3" },
    { value: "GRADE4", label: "Grade 4" },
    { value: "GRADE5", label: "Grade 5" },
    { value: "GRADE6", label: "Grade 6" },
    { value: "GRADE7", label: "Grade 7" },
    { value: "GRADE8", label: "Grade 8" },
    { value: "GRADE9", label: "Grade 9" },
    { value: "GRADE10", label: "Grade 10" },
    { value: "GRADE11", label: "Grade 11" },
    { value: "GRADE12", label: "Grade 12" },
  ];

  const preferredTimeOptions = [
    { value: "WEEKDAYS", label: "Weekdays" },
    { value: "WEEKEND", label: "Weekend" },
  ];

  const preferredTutorOptions = [
    { value: "FEMALE_TUTOR", label: "Female Tutor" },
    { value: "MALE_TUTOR", label: "Male Tutor" },
    { value: "BOTH", label: "Both" },
  ];

  const sessionTypeOptions = [
    { value: "ONLINE_SESSIONS", label: "Online Sessions" },
    { value: "OFFLINE_SESSIONS", label: "Offline Sessions" },
  ];

  // Load form progress on component mount
  useEffect(() => {
    loadFormProgress();
  }, []);

  // Check authentication status
  useEffect(() => {
    const token = tokenUtils.getToken();
    if (!token) {
      setError(
        "Please log in to access the student form. You will be redirected to the login page."
      );
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    }
  }, []);

  // Load categories when reaching step 6
  useEffect(() => {
    if (currentStep === 6 && categories.length === 0) {
      loadCategories();
    }
  }, [currentStep, categories.length]);

  // Load subcategories when reaching step 7 and categories are selected
  useEffect(() => {
    if (currentStep === 7 && selectedCategories.length > 0) {
      loadSubcategoriesForMultipleCategories(selectedCategories);
    }
  }, [currentStep, selectedCategories]);

  const loadFormProgress = async () => {
    try {
      setLoading(true);
      const response = (await studentFormAPI.getFormProgress()) as ApiResponse;
      if (response.success && response.data) {
        const formData = response.data as FormProgress;
        setFormData(formData);
        setCurrentStep(formData.currentStep || 1);

        // Parse selected categories and subcategories if they exist
        if (formData.selectedCategories) {
          try {
            const categories = JSON.parse(formData.selectedCategories);
            setSelectedCategories(categories);
          } catch (e) {
            console.error("Error parsing selected categories:", e);
          }
        }
        if (formData.selectedSubcategories) {
          try {
            const subcategories = JSON.parse(formData.selectedSubcategories);
            setSelectedSubcategories(subcategories);
          } catch (e) {
            console.error("Error parsing selected subcategories:", e);
          }
        }
      } else {
        // If no form progress exists, start from step 1
        setCurrentStep(1);
        setFormData(null);
        setSelectedCategories([]);
        setSelectedSubcategories([]);
      }
    } catch (error) {
      console.error("Error loading form progress:", error);
      // If there's an error (like "Student not found" or "Unauthorized"), start from step 1
      setCurrentStep(1);
      setFormData(null);
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      // Don't show error to user, just start the form
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = (await authAPI.getTutoringCategories()) as ApiResponse;
      if (response.success && response.data) {
        setCategories(response.data as Material[]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("Failed to load categories");
    }
  };

  const loadSubcategories = async (parentId: string) => {
    try {
      const response = (await authAPI.getTutoringSubcategories(
        parentId
      )) as ApiResponse;
      if (response.success && response.data) {
        setSubcategories(response.data as Material[]);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
      setError("Failed to load subcategories");
    }
  };

  const loadSubcategoriesForMultipleCategories = async (
    categoryIds: string[]
  ) => {
    try {
      setSubcategories([]); // Clear existing subcategories

      // Load subcategories for each selected category
      const allSubcategories: Material[] = [];

      for (const categoryId of categoryIds) {
        const response = (await authAPI.getTutoringSubcategories(
          categoryId
        )) as ApiResponse;
        if (response.success && response.data) {
          allSubcategories.push(...(response.data as Material[]));
        }
      }

      // Remove duplicates based on ID
      const uniqueSubcategories = allSubcategories.filter(
        (subcategory, index, self) =>
          index === self.findIndex((s) => s.id === subcategory.id)
      );

      setSubcategories(uniqueSubcategories);
    } catch (error) {
      console.error(
        "Error loading subcategories for multiple categories:",
        error
      );
      setError("Failed to load subcategories");
    }
  };

  const saveStep = async (
    stepNumber: number,
    stepData: Record<string, string | string[]>
  ) => {
    try {
      setSaving(true);
      setError(null);

      const response = (await studentFormAPI.saveFormStep(
        stepNumber,
        stepData
      )) as ApiResponse;

      if (response.success) {
        const formData = response.data as FormProgress;
        setFormData(formData);

        // If this is the final step and form is completed
        if (stepNumber === 10 && formData?.isCompleted) {
          if (onComplete) {
            onComplete();
          }
        } else {
          // Move to next step
          setCurrentStep(stepNumber + 1);
        }
      } else {
        setError(response.message || "Failed to save step");
      }
    } catch (error: unknown) {
      console.error("Error saving step:", error);
      const errorMessage = (error as Error).message;

      // Check if it's an authentication error
      if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401")
      ) {
        setError("Please log in to continue. Redirecting to login page...");
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (errorMessage.includes("Student not found")) {
        setError("Student profile not found. Creating profile...");
        // Try to create student profile
        try {
          const createResponse = await studentFormAPI.createProfile();
          if ((createResponse as ApiResponse).success) {
            setError("Profile created successfully. Please try again.");
            // Retry saving the step
            setTimeout(() => {
              saveStep(stepNumber, stepData);
            }, 1000);
          } else {
            setError(
              "Failed to create student profile. Please contact support."
            );
          }
        } catch (createError) {
          setError("Failed to create student profile. Please contact support.");
        }
      } else {
        setError(errorMessage || "Failed to save step");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStepSubmit = async (
    stepData: Record<string, string | string[]>
  ) => {
    await saveStep(currentStep, stepData);
  };

  const goToStep = (step: number) => {
    if (step <= (formData?.currentStep || 1) && step >= 1) {
      setCurrentStep(step);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOne
            value={formData?.studentType}
            options={studentTypeOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 2:
        return (
          <StepTwo
            value={formData?.inclusiveLearning}
            options={inclusiveLearningOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 3:
        return (
          <StepThree
            value={formData?.formGender}
            options={genderOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 4:
        return (
          <StepFour
            value={formData?.curriculum}
            options={curriculumOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 5:
        return (
          <StepFive
            value={formData?.grade}
            options={gradeOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 6:
        return (
          <StepSix
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 7:
        return (
          <StepSeven
            subcategories={subcategories}
            selectedSubcategories={selectedSubcategories}
            setSelectedSubcategories={setSelectedSubcategories}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 8:
        return (
          <StepEight
            value={formData?.preferredTime}
            options={preferredTimeOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 9:
        return (
          <StepNine
            value={formData?.preferredTutor}
            options={preferredTutorOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      case 10:
        return (
          <StepTen
            value={formData?.sessionType}
            options={sessionTypeOptions}
            onSubmit={handleStepSubmit}
            loading={saving}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Progress Bar */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-white'>
            Student Information Form
          </h2>
          <span className='text-[#97beda]'>Step {currentStep} of 10</span>
        </div>

        <div className='w-full bg-white/20 rounded-full h-2'>
          <div
            className='bg-gradient-to-r from-[#97beda] to-white h-2 rounded-full transition-all duration-300'
            style={{ width: `${(currentStep / 10) * 100}%` }}></div>
        </div>

        {/* Step indicators */}
        <div className='flex justify-between mt-4'>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              disabled={step > (formData?.currentStep || 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === currentStep
                  ? "bg-white text-[#041932]"
                  : step <= (formData?.currentStep || 1)
                  ? "bg-[#97beda] text-white hover:bg-white hover:text-[#041932] cursor-pointer"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
              }`}>
              {step}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg'>
          <p className='text-red-200'>{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8'>
        {renderStepContent()}
      </div>
    </div>
  );
};

// Individual step components
interface StepProps {
  value?: string;
  options: { value: string; label: string }[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  loading: boolean;
}

const StepOne: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ studentType: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>Student Type</h3>
        <p className='text-[#97beda] mb-6'>Please select your role:</p>

        <div className='space-y-3'>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='studentType'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

const StepTwo: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ inclusiveLearning: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Inclusive Learning
        </h3>
        <p className='text-[#97beda] mb-6'>
          Do you have any specific learning needs?
        </p>

        <div className='space-y-3'>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='inclusiveLearning'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

const StepThree: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ formGender: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>Gender</h3>
        <p className='text-[#97beda] mb-6'>Please select your gender:</p>

        <div className='space-y-3'>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='formGender'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

const StepFour: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ curriculum: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>Curriculum</h3>
        <p className='text-[#97beda] mb-6'>
          Please select your curriculum system:
        </p>

        <div className='space-y-3'>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='curriculum'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

const StepFive: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ grade: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>Grade</h3>
        <p className='text-[#97beda] mb-6'>Please select your current grade:</p>

        <div className='grid grid-cols-2 gap-3 '>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='grade'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

interface StepSixProps {
  categories: Material[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  onSubmit: (data: Record<string, string[]>) => Promise<void>;
  loading: boolean;
}

const StepSix: React.FC<StepSixProps> = ({
  categories,
  selectedCategories,
  setSelectedCategories,
  onSubmit,
  loading,
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length > 0) {
      await onSubmit({ selectedCategories });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Subject Categories Selection
        </h3>
        <p className='text-[#97beda] mb-6'>
          Please select one or more subject categories you&apos;re interested
          in:
        </p>

        <div className='space-y-3'>
          {categories.map((category) => (
            <label
              key={category.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCategories.includes(category.id)
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='checkbox'
                name='selectedCategories'
                value={category.id}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded border-2 mr-3 ${
                  selectedCategories.includes(category.id)
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selectedCategories.includes(category.id) && (
                  <div className='w-full h-full flex items-center justify-center text-white text-xs'>
                    ✓
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <span className='text-white font-medium'>{category.name}</span>
                {category.description && (
                  <p className='text-white/70 text-sm mt-1'>
                    {category.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>

        {selectedCategories.length > 0 && (
          <div className='bg-[#97beda]/10 border border-[#97beda]/30 rounded-lg p-4 mt-4'>
            <h4 className='text-white font-medium mb-2'>
              Selected Categories ({selectedCategories.length}):
            </h4>
            <div className='flex flex-wrap gap-2'>
              {selectedCategories.map((categoryId) => {
                const category = categories.find(
                  (cat) => cat.id === categoryId
                );
                return (
                  <span
                    key={categoryId}
                    className='px-3 py-1 bg-[#97beda]/20 text-[#97beda] rounded-full text-sm'>
                    {category?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        type='submit'
        disabled={selectedCategories.length === 0 || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

interface StepSevenProps {
  subcategories: Material[];
  selectedSubcategories: string[];
  setSelectedSubcategories: (subcategories: string[]) => void;
  onSubmit: (data: Record<string, string[]>) => Promise<void>;
  loading: boolean;
}

const StepSeven: React.FC<StepSevenProps> = ({
  subcategories,
  selectedSubcategories,
  setSelectedSubcategories,
  onSubmit,
  loading,
}) => {
  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories(
      selectedSubcategories.includes(subcategoryId)
        ? selectedSubcategories.filter((id) => id !== subcategoryId)
        : [...selectedSubcategories, subcategoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubcategories.length > 0) {
      await onSubmit({ selectedSubcategories });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Specific Subjects Selection
        </h3>
        <p className='text-[#97beda] mb-6'>
          Please select the specific subjects you&apos;re interested in:
        </p>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              type='button'
              onClick={() => toggleSubcategory(subcategory.id)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                selectedSubcategories.includes(subcategory.id)
                  ? "border-[#97beda] bg-[#97beda]/20 text-white"
                  : "border-white/30 text-white/80 hover:border-white/50 hover:text-white"
              }`}>
              {subcategory.name}
            </button>
          ))}
        </div>

        {selectedSubcategories.length > 0 && (
          <div className='mt-4'>
            <p className='text-[#97beda] text-sm'>
              Selected: {selectedSubcategories.length} subject
              {selectedSubcategories.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      <button
        type='submit'
        disabled={selectedSubcategories.length === 0 || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

const StepEight: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ preferredTime: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Preferred Time
        </h3>
        <p className='text-[#97beda] mb-6'>
          When would you prefer to have your sessions?
        </p>

        <div className='space-y-3'>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='preferredTime'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

const StepNine: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ preferredTutor: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Preferred Tutor
        </h3>
        <p className='text-[#97beda] mb-6'>
          What is your tutor gender preference?
        </p>

        <div className='space-y-3'>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='preferredTutor'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
};

const StepTen: React.FC<StepProps> = ({
  value,
  options,
  onSubmit,
  loading,
}) => {
  const [selected, setSelected] = useState(value || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await onSubmit({ sessionType: selected });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>Session Type</h3>
        <p className='text-[#97beda] mb-6'>
          How would you prefer to attend your sessions?
        </p>

        <div className='space-y-3'>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-[#97beda] bg-[#97beda]/20"
                  : "border-white/30 hover:border-white/50"
              }`}>
              <input
                type='radio'
                name='sessionType'
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => setSelected(e.target.value)}
                className='sr-only'
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selected === option.value
                    ? "border-[#97beda] bg-[#97beda]"
                    : "border-white/50"
                }`}>
                {selected === option.value && (
                  <div className='w-full h-full rounded-full bg-white scale-50'></div>
                )}
              </div>
              <span className='text-white'>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type='submit'
        disabled={!selected || loading}
        className='w-full bg-gradient-to-r from-[#97beda] to-white text-[#041932] font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Complete Form" : "Complete Form"}
      </button>
    </form>
  );
};

export default MultiStepStudentForm;
