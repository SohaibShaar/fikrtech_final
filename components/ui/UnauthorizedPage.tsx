"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, ArrowLeft, House } from "@phosphor-icons/react";
import StarField from "./StarField";

interface UnauthorizedPageProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export default function UnauthorizedPage({
  title = "Access Denied",
  message = "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
  showHomeButton = true,
  showBackButton = true,
}: UnauthorizedPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
        starCount={30}
        speed={0.05}
        twinkleSpeed={0.008}
        minSize={0.1}
        maxSize={0.8}
      />

      {/* Header */}
      <header className='absolute top-0 left-0 right-0 z-20 bg-transparent py-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16 justify-between'>
            <div className='flex-shrink-0'>
              <Image
                src='/logoFikrTech.png'
                alt='FikrTech Logo'
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20'>
        <div className='text-center max-w-2xl'>
          {/* Error Icon */}
          <div className='mb-8'>
            <div className='mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6'>
              <Shield className='text-red-400' size={48} />
            </div>
          </div>

          {/* Error Message */}
          <h1 className='text-4xl md:text-5xl font-bold text-white mb-6'>
            {title}
          </h1>

          <p className='text-[#97beda] text-lg mb-8 leading-relaxed'>
            {message}
          </p>

          {/* Error Code */}
          <div className='mb-8'>
            <span className='inline-block px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-mono text-sm'>
              Error 403 - Forbidden
            </span>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            {showBackButton && (
              <button
                onClick={() => window.history.back()}
                className='group flex items-center justify-center px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium'>
                <ArrowLeft
                  className='mr-2 transform transition-transform duration-300 group-hover:-translate-x-1'
                  size={20}
                />
                Go Back
              </button>
            )}

            {showHomeButton && (
              <Link
                href='/'
                className='group flex items-center justify-center px-6 py-3 bg-[#97beda]/20 border border-[#97beda]/30 text-[#97beda] rounded-lg hover:bg-[#97beda]/30 transition-all duration-300 font-medium'>
                <House
                  className='mr-2 transform transition-transform duration-300 group-hover:scale-110'
                  size={20}
                />
                Back to Home
              </Link>
            )}
          </div>

          {/* Additional Help */}
          <div className='mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg'>
            <h3 className='text-white text-lg font-semibold mb-3'>
              Need Help?
            </h3>
            <p className='text-gray-300 text-sm mb-4'>
              If you believe you should have access to this page, please contact
              your system administrator.
            </p>
            <div className='flex flex-col sm:flex-row gap-2 text-sm'>
              <span className='text-gray-400'>Contact:</span>
              <a
                href='mailto:admin@fikrtech.com'
                className='text-[#97beda] hover:text-white transition-colors'>
                admin@fikrtech.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient transition */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20' />
    </div>
  );
}
