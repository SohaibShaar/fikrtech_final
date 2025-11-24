"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MultiStepTeacherForm from "../../components/MultiStepTeacherForm";
import StarField from "../../components/ui/StarField";
import Loader from "../../components/ui/Loader";
import { tokenUtils } from "../../lib/api";

const API_BASE_URL = "http://localhost:5000";

export default function TeacherRegistrationPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/teacher/registration/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        // Check if registration is complete
        if (data.data.completedSteps && data.data.completedSteps.length === 8) {
          setHasProfile(true);
          // Redirect to profile page
          router.push("/teacher/profile");
          return;
        }
      }

      setIsChecking(false);
    } catch (error) {
      console.error("Error checking registration status:", error);
      setIsChecking(false);
    }
  };

  const handleComplete = () => {
    // Redirect to teacher profile page after successful registration
    router.push("/teacher/profile");
  };

  if (isChecking) {
    return <Loader message="Checking registration status..." />;
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322]"
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}
    >
      {/* Custom SVG Background with fade-in animation */}
      <div
        className={`absolute inset-0 transition-opacity duration-2000 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 4000 3000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="filter">
              <feGaussianBlur stdDeviation="150" />
            </filter>
          </defs>
          <g
            filter="url(#filter)"
            className={`transition-all duration-[3000ms] ease-in-out ${
              isLoaded
                ? "translate-x-0 translate-y-0 opacity-100"
                : "-translate-x-full -translate-y-full opacity-0"
            }`}
          >
            <ellipse
              cx="4300.71"
              cy="1600.501"
              rx="1924.71"
              ry="273.501"
              transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
              fill="white"
              fillOpacity="0.21"
            />
          </g>
        </svg>
      </div>

      {/* Animated StarField Background */}
      <StarField
        className="opacity-95"
        starCount={50}
        speed={0.08}
        twinkleSpeed={0.01}
        minSize={0.2}
        maxSize={1.2}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Teacher Registration
            </h1>
            <p className="text-[#97beda] text-lg">
              Complete your profile to start teaching on FikrTech
            </p>
          </div>

          <MultiStepTeacherForm onComplete={handleComplete} />
        </div>
      </div>

      {/* Bottom gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20" />
    </div>
  );
}

