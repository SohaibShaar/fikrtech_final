"use client";

import { useState, useEffect } from "react";
import { tokenUtils } from "@/lib/api";

// Types for form steps
interface TeacherFormData {
  // Step 1
  fullName: string;
  gender: string;
  nationality: string;
  dateOfBirth: string;
  phone: string;
  profilePhoto?: string;

  // Step 2
  selectedRoles: string[];

  // Step 3
  selectedSubOptions: string[];

  // Step 4
  selectedDeepOptions: string[];
  otherOptions: string[];

  // Step 5
  universityAffiliation?: string;
  highestEducation?: string;
  yearsExperience?: number;
  languagesSpoken: string[];
  shortBio?: string;
  shortVideo?: string;

  // Step 6
  preferredTutoringTime?: string;
  preferredTutoringMethod?: string;
  location?: string;
  proposedHourlyRate?: number;

  // Step 7
  cvFile?: string;
  certificates: string[];

  // Step 8
  agreedToTerms: boolean;
}

interface DynamicOption {
  id: string;
  name: string;
  description?: string;
  parentRole: string;
  children?: DynamicOption[];
}

interface MultiStepTeacherFormProps {
  onComplete?: () => void;
}

const API_BASE_URL = "http://localhost:5000";

const MultiStepTeacherForm: React.FC<MultiStepTeacherFormProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TeacherFormData>({
    fullName: "",
    gender: "",
    nationality: "",
    dateOfBirth: "",
    phone: "",
    selectedRoles: [],
    selectedSubOptions: [],
    selectedDeepOptions: [],
    otherOptions: [],
    languagesSpoken: [],
    certificates: [],
    agreedToTerms: false,
  });

  const [dynamicOptions, setDynamicOptions] = useState<DynamicOption[]>([]);
  const [deepOptions, setDeepOptions] = useState<DynamicOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 8;

  // Fetch dynamic options when roles are selected
  useEffect(() => {
    if (currentStep === 3 && formData.selectedRoles.length > 0) {
      fetchDynamicOptions();
    }
  }, [currentStep, formData.selectedRoles]);

  // Fetch deep options when sub-options are selected
  useEffect(() => {
    if (currentStep === 4 && formData.selectedSubOptions.length > 0) {
      fetchDeepOptions();
    }
  }, [currentStep, formData.selectedSubOptions]);

  const fetchDynamicOptions = async () => {
    try {
      const role = formData.selectedRoles[0]; // Use first selected role
      const response = await fetch(
        `${API_BASE_URL}/api/teacher/dynamic-options?role=${role}`
      );
      const data = await response.json();
      if (data.success) {
        setDynamicOptions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching dynamic options:", error);
    }
  };

  const fetchDeepOptions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teacher/deep-options`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentIds: formData.selectedSubOptions }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setDeepOptions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching deep options:", error);
    }
  };

  const saveStep = async (step: number, data: any) => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/teacher/registration/step/${step}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error saving step:", error);
      return false;
    }
  };

  const handleNext = async () => {
    setError("");
    setLoading(true);

    // Validate and save current step
    let stepData: any = {};
    let isValid = true;

    switch (currentStep) {
      case 1:
        if (
          !formData.fullName ||
          !formData.gender ||
          !formData.nationality ||
          !formData.dateOfBirth ||
          !formData.phone
        ) {
          setError("Please fill in all required fields");
          isValid = false;
        } else {
          stepData = {
            fullName: formData.fullName,
            gender: formData.gender,
            nationality: formData.nationality,
            dateOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            profilePhoto: formData.profilePhoto,
          };
        }
        break;

      case 2:
        if (formData.selectedRoles.length === 0) {
          setError("Please select at least one role");
          isValid = false;
        } else {
          stepData = { selectedRoles: formData.selectedRoles };
        }
        break;

      case 3:
        if (formData.selectedSubOptions.length === 0) {
          setError("Please select at least one option");
          isValid = false;
        } else {
          stepData = { selectedSubOptions: formData.selectedSubOptions };
        }
        break;

      case 4:
        stepData = {
          selectedDeepOptions: formData.selectedDeepOptions,
          otherOptions: formData.otherOptions,
        };
        break;

      case 5:
        stepData = {
          universityAffiliation: formData.universityAffiliation,
          highestEducation: formData.highestEducation,
          yearsExperience: formData.yearsExperience,
          languagesSpoken: formData.languagesSpoken,
          shortBio: formData.shortBio,
          shortVideo: formData.shortVideo,
        };
        break;

      case 6:
        stepData = {
          preferredTutoringTime: formData.preferredTutoringTime,
          preferredTutoringMethod: formData.preferredTutoringMethod,
          location: formData.location,
          proposedHourlyRate: formData.proposedHourlyRate,
        };
        break;

      case 7:
        stepData = {
          cvFile: formData.cvFile,
          certificates: formData.certificates,
        };
        break;

      case 8:
        if (!formData.agreedToTerms) {
          setError("You must agree to the terms and conditions");
          isValid = false;
        } else {
          stepData = { agreedToTerms: formData.agreedToTerms };
        }
        break;
    }

    if (isValid) {
      const saved = await saveStep(currentStep, stepData);
      if (saved) {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
        } else {
          // Submit complete registration
          await submitRegistration();
        }
      } else {
        setError("Failed to save step. Please try again.");
      }
    }

    setLoading(false);
  };

  const submitRegistration = async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/teacher/registration/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (result.success) {
        if (onComplete) {
          onComplete();
        }
      } else {
        setError(result.message || "Failed to submit registration");
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      setError("Failed to submit registration. Please try again.");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Basic Information
            </h2>

            <div>
              <label className="block text-white mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateFormData("fullName", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => updateFormData("gender", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Nationality *</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => updateFormData("nationality", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Select Your Roles *
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {["TUTORING", "TEACHING", "COURSING", "COACHING"].map((role) => (
                <label
                  key={role}
                  className="flex items-center space-x-2 text-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedRoles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData("selectedRoles", [
                          ...formData.selectedRoles,
                          role,
                        ]);
                      } else {
                        updateFormData(
                          "selectedRoles",
                          formData.selectedRoles.filter((r) => r !== role)
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Select Subjects/Areas *
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {dynamicOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-2 text-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedSubOptions.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData("selectedSubOptions", [
                          ...formData.selectedSubOptions,
                          option.id,
                        ]);
                      } else {
                        updateFormData(
                          "selectedSubOptions",
                          formData.selectedSubOptions.filter(
                            (id) => id !== option.id
                          )
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>{option.name}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Additional Specializations (Optional)
            </h2>
            {deepOptions.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {deepOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-2 text-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedDeepOptions.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData("selectedDeepOptions", [
                            ...formData.selectedDeepOptions,
                            option.id,
                          ]);
                        } else {
                          updateFormData(
                            "selectedDeepOptions",
                            formData.selectedDeepOptions.filter(
                              (id) => id !== option.id
                            )
                          );
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span>{option.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-white/70">
                No additional options available. Click Next to continue.
              </p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Education & Experience
            </h2>

            <div>
              <label className="block text-white mb-2">
                University Affiliation
              </label>
              <input
                type="text"
                value={formData.universityAffiliation || ""}
                onChange={(e) =>
                  updateFormData("universityAffiliation", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Highest Education</label>
              <select
                value={formData.highestEducation || ""}
                onChange={(e) =>
                  updateFormData("highestEducation", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">Select Education Level</option>
                <option value="BACHELOR">Bachelor</option>
                <option value="MASTER">Master</option>
                <option value="MBA">MBA</option>
                <option value="PHD">PhD</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Years of Experience</label>
              <input
                type="number"
                value={formData.yearsExperience || ""}
                onChange={(e) =>
                  updateFormData("yearsExperience", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                min="0"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Short Bio</label>
              <textarea
                value={formData.shortBio || ""}
                onChange={(e) => updateFormData("shortBio", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                rows={4}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Teaching Preferences
            </h2>

            <div>
              <label className="block text-white mb-2">
                Preferred Tutoring Time
              </label>
              <select
                value={formData.preferredTutoringTime || ""}
                onChange={(e) =>
                  updateFormData("preferredTutoringTime", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">Select Time Preference</option>
                <option value="WEEKDAYS">Weekdays</option>
                <option value="WEEKENDS">Weekends</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">
                Preferred Tutoring Method
              </label>
              <select
                value={formData.preferredTutoringMethod || ""}
                onChange={(e) =>
                  updateFormData("preferredTutoringMethod", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">Select Method</option>
                <option value="ONLINE">Online</option>
                <option value="PHYSICAL">Physical</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Location</label>
              <select
                value={formData.location || ""}
                onChange={(e) => updateFormData("location", e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">Select Location</option>
                <option value="UAE">UAE</option>
                <option value="LEBANON">Lebanon</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">
                Proposed Hourly Rate (AED)
              </label>
              <input
                type="number"
                value={formData.proposedHourlyRate || ""}
                onChange={(e) =>
                  updateFormData("proposedHourlyRate", parseFloat(e.target.value))
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                min="0"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Documents (Optional)
            </h2>
            <p className="text-white/70 mb-4">
              Upload your CV and certificates to strengthen your profile
            </p>
            <div className="text-white/70">
              <p>File upload functionality will be added here</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Terms and Conditions
            </h2>

            <div className="bg-white/10 p-4 rounded-lg max-h-60 overflow-y-auto">
              <p className="text-white/90 text-sm">
                By registering as a teacher on FikrTech, you agree to:
                <br />
                <br />
                1. Provide accurate and truthful information
                <br />
                2. Maintain professional conduct with students
                <br />
                3. Deliver quality educational services
                <br />
                4. Comply with platform policies and guidelines
                <br />
                5. Respect student privacy and confidentiality
                <br />
                <br />
                Your profile will be reviewed by our admin team before approval.
              </p>
            </div>

            <label className="flex items-center space-x-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) =>
                  updateFormData("agreedToTerms", e.target.checked)
                }
                className="w-4 h-4"
              />
              <span>I agree to the terms and conditions *</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-white text-sm">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-white text-sm">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-[#97beda] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
        {renderStep()}

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? "Saving..."
              : currentStep === totalSteps
              ? "Submit"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiStepTeacherForm;

