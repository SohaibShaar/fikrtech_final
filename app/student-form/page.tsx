"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StarField from "../../components/ui/StarField";
import { tokenUtils } from "@/lib/api";
import MultiStepStudentForm from "@/components/MultiStepStudentForm";

export default function StudentFormPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    tokenUtils.removeToken();
    window.location.href = "/login";
  };

  const handleFormComplete = () => {
    setFormCompleted(true);
    // Optionally redirect to dashboard or another page
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  };

  return (
    <div
      className='relative min-h-screen overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322]'
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}>
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
                href='#'
                onClick={handleLogout}
                className='text-white hover:text-[#97beda] transition-colors duration-200 font-medium'>
                Logout
              </Link>
              <Link
                href='/'
                className='text-white hover:text-[#97beda] transition-colors duration-200 font-medium'>
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20'>
        {!formCompleted ? (
          <div className='w-full max-w-4xl'>
            <div className='text-center mb-8'>
              <h1 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                Complete Your Student Profile
              </h1>
              <p className='text-[#97beda] text-lg mb-8'>
                Please complete your student information form to access all
                features of the platform.
              </p>
            </div>

            {/* Multi-Step Form */}
            <MultiStepStudentForm onComplete={handleFormComplete} />
          </div>
        ) : (
          <div className='text-center max-w-2xl'>
            <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8'>
              <div className='text-white text-center'>
                <div className='text-6xl mb-4'>🎉</div>
                <h2 className='text-3xl font-bold mb-4'>Form Completed!</h2>
                <p className='text-[#97beda] text-lg mb-6'>
                  Thank you for completing your student profile. You now have
                  access to all platform features.
                </p>
                <p className='text-gray-300'>
                  Redirecting you to the main page in a few seconds...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient transition */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20' />
    </div>
  );
}
