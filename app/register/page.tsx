"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  User,
  Envelope,
  Phone,
  Lock,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import StarField from "../../components/ui/StarField";
import Loader from "../../components/ui/Loader";
import { authAPI, formCompletionAPI, tokenUtils } from "../../lib/api";

// Add global style to override browser autofill styles
const globalStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1) inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
    background-color: rgba(255, 255, 255, 1) !important;
  }
`;

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    token: string;
  };
}

interface FormStatusResponse {
  success: boolean;
  message: string;
  data: {
    isCompleted: boolean;
    currentStep: number;
    totalSteps: number;
    progress: number;
  };
}

export default function RegisterPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingForm, setIsCheckingForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT" as "STUDENT" | "TEACHER",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRoleChange = (role: "STUDENT" | "TEACHER") => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "phone is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkFormCompletionStatus = async () => {
    try {
      const response =
        (await formCompletionAPI.getStatus()) as FormStatusResponse;

      if (response.success && response.data) {
        if (response.data.isCompleted) {
          // إعادة توجيه للصفحة الرئيسية
          router.push("/");
        } else {
          // إعادة توجيه لصفحة إكمال النموذج
          router.push("/student-form");
        }
      } else {
        // في حالة عدم وجود بيانات أو خطأ، توجيه للصفحة الرئيسية
        router.push("/");
      }
    } catch (error) {
      console.error("Error checking form status:", error);
      // في حالة الخطأ، توجيه للصفحة الرئيسية
      router.push("/");
    }
  };

  const handleUserRedirection = async (user: {
    id: string;
    email: string;
    role: string;
  }) => {
    // فحص دور المستخدم
    if (user.role === "ADMIN") {
      // إعادة توجيه الـ Admin إلى لوحة التحكم
      router.push("/admin");
    } else if (user.role === "STUDENT") {
      // فحص حالة النموذج للطلاب
      setIsCheckingForm(true);
      await checkFormCompletionStatus();
    } else if (user.role === "TEACHER") {
      // إعادة توجيه المعلمين لصفحة التسجيل
      router.push("/teacher-registration");
    } else {
      // إعادة توجيه افتراضي للصفحة الرئيسية
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = (await authAPI.register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName,
        phone: formData.phone,
      })) as RegisterResponse;

      if (response.success && response.data && response.data.token) {
        // تخزين JWT Token في LocalStorage
        tokenUtils.setToken(response.data.token);

        setMessage("Registration successful! Redirecting...");

        // إعادة توجيه حسب دور المستخدم
        await handleUserRedirection(response.data.user);
      } else {
        setMessage("Registration successful! You can now login.");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          role: "STUDENT",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during registration";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsCheckingForm(false);
    }
  };

  // Show loader during redirection
  if (isCheckingForm) {
    return <Loader message='Redirecting to your dashboard...' />;
  }

  return (
    <div
      className='relative min-h-screen overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322]'
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}>
      {/* Apply global styles to fix autofill background */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      {/* Custom SVG Background with fade-in animation */}
      <div
        className={`absolute inset-0 transition-opacity duration-2000 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}>
        <svg
          className='absolute inset-0 w-full h-full'
          viewBox='0 0 4000 3000'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <filter id='filter'>
              <feGaussianBlur stdDeviation='150' />
            </filter>
          </defs>
          <g
            filter='url(#filter)'
            className={`transition-all duration-[3000ms] ease-in-out ${
              isLoaded
                ? "translate-x-0 translate-y-0 opacity-100"
                : "-translate-x-full -translate-y-full opacity-0"
            }`}>
            <ellipse
              cx='4300.71'
              cy='1600.501'
              rx='1924.71'
              ry='273.501'
              transform='matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)'
              fill='white'
              fillOpacity='0.21'
            />
          </g>
        </svg>
      </div>

      {/* Animated StarField Background */}
      <StarField
        className='opacity-95'
        starCount={50}
        speed={0.08}
        twinkleSpeed={0.01}
        minSize={0.2}
        maxSize={1.2}
      />

      {/* Simple animated background pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute inset-0 animate-pulse'>
          <div
            className='w-full h-full'
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}></div>
        </div>
      </div>

      {/* Header */}
      <header className='absolute top-0 left-0 right-0 z-20 bg-transparent py-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16 justify-between'>
            <div className='flex-shrink-0'>
              <Image
                src='/logoFikrTech.png'
                alt='Logo'
                width={100}
                height={100}
              />
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='text-white hover:text-[#97beda] transition-colors duration-200 font-medium'>
                Home
              </Link>
              <Link
                href='/login'
                className='text-white hover:text-[#97beda] transition-colors duration-200 font-medium'>
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Registration Form */}

      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20'>
        <h1 className='text-4xl md:text-5xl font-bold text-white mb-2 mt-4'>
          Create a new account
        </h1>
        <p className='text-[#97beda] text-lg'>
          Join the FikrTech educational community
        </p>
        <div className='w-full max-w-md'>
          {/* Title */}
          <div className='text-center mb-8'></div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='space-y-6'
            style={{
              fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif",
            }}>
            {/* Full Name */}
            <div>
              <label
                htmlFor='fullName'
                className='block text-sm font-medium text-white mb-2'>
                Full Name
              </label>
              <div className='relative'>
                <User
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='text'
                  id='fullName'
                  name='fullName'
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97beda] focus:border-transparent focus:bg-white/10 transition-all duration-300'
                  placeholder='Enter your full name'
                  style={{
                    fontFamily:
                      "'Instrument Sans', Arial, Helvetica, sans-serif",
                  }}
                />
              </div>
              {errors.fullName && (
                <p className='mt-1 text-sm text-red-400'>{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-white mb-2'>
                Email
              </label>
              <div className='relative'>
                <Envelope
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97beda] focus:border-transparent focus:bg-white/10 transition-all duration-300'
                  placeholder='Enter your email'
                  style={{
                    fontFamily:
                      "'Instrument Sans', Arial, Helvetica, sans-serif",
                  }}
                />
              </div>
              {errors.email && (
                <p className='mt-1 text-sm text-red-400'>{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-white mb-2'>
                Phone
              </label>
              <div className='relative'>
                <Phone
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97beda] focus:border-transparent focus:bg-white/10 transition-all duration-300'
                  placeholder='Enter your phone number'
                  style={{
                    fontFamily:
                      "'Instrument Sans', Arial, Helvetica, sans-serif",
                  }}
                />
              </div>
              {errors.phone && (
                <p className='mt-1 text-sm text-red-400'>{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-white mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id='password'
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97beda] focus:border-transparent focus:bg-white/10 transition-all duration-300'
                  placeholder='Enter your password'
                  style={{
                    fontFamily:
                      "'Instrument Sans', Arial, Helvetica, sans-serif",
                  }}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none'
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className='mt-1 text-sm text-red-400'>{errors.password}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className='block text-sm font-medium text-white mb-3'>
                Choose your role
              </label>
              <div className='flex space-x-4 rtl:space-x-reverse'>
                <label className='flex items-center cursor-pointer'>
                  <input
                    type='radio'
                    name='role'
                    value='STUDENT'
                    checked={formData.role === "STUDENT"}
                    onChange={() => handleRoleChange("STUDENT")}
                    className='sr-only'
                  />
                  <div
                    className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      formData.role === "STUDENT"
                        ? "bg-[#97beda]/20 border-[#97beda] text-white"
                        : "bg-white/10 border-white/20 text-gray-300 hover:border-white/40"
                    }`}>
                    Student
                  </div>
                </label>
                <label className='flex items-center cursor-pointer'>
                  <input
                    type='radio'
                    name='role'
                    value='TEACHER'
                    checked={formData.role === "TEACHER"}
                    onChange={() => handleRoleChange("TEACHER")}
                    className='sr-only'
                  />
                  <div
                    className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      formData.role === "TEACHER"
                        ? "bg-[#97beda]/20 border-[#97beda] text-white"
                        : "bg-white/10 border-white/20 text-gray-300 hover:border-white/40"
                    }`}>
                    Teacher
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-white/10 group border border-white/20 text-white px-6 py-4 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
              style={{
                fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif",
              }}>
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2'></div>
                  Registering...
                </div>
              ) : (
                <div className='flex items-center justify-center'>
                  Create account
                  <ArrowRight
                    className='mx-2 transform transition-transform duration-300 group-hover:translate-x-1'
                    size={20}
                  />
                </div>
              )}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`text-center p-4 rounded-lg ${
                  message.includes("success")
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : "bg-red-500/20 border border-red-500/30 text-red-400"
                }`}>
                {message}
              </div>
            )}

            {/* Login Link */}
            <div className='text-center'>
              <p className='text-gray-300'>
                Already have an account?{" "}
                <Link
                  href='/login'
                  className='text-[#97beda] hover:text-white cursor-pointer transition-colors duration-200 font-medium inline-block'>
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom gradient transition */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20' />
    </div>
  );
}
