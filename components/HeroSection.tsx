"use client";

import { ArrowRight, Phone } from "@phosphor-icons/react";

interface HeroSectionProps {
  children?: React.ReactNode;
}

const HeroSection = ({ children }: HeroSectionProps) => {
  return (
    <div className='relative min-h-screen overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322]'>
      {/* Simple animated background pattern */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute inset-0 animate-pulse'>
          {/* Simple dots pattern */}
          <div
            className='w-full h-full'
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}></div>
        </div>
      </div>

      {children}

      {/* Hero Section Content */}
      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4'>
        <h1 className='text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-6'>
          Hello To The <span className='text-[#36FFFF]'>Fikrtech</span>
        </h1>
        <p className='text-gray-300 text-lg md:text-2xl lg:text-3xl mb-10 max-w-2xl'>
          Where Knowledge Meets Community
        </p>
        <div className='flex flex-col sm:flex-row items-center gap-4'>
          <button className='bg-white text-black text-base font-medium px-6 py-3 rounded-lg group hover:bg-gray-100 transition-all duration-300 flex items-center'>
            Start With Us
            <ArrowRight
              className='ml-2 transform transition-transform duration-300 group-hover:translate-x-1'
              size={20}
            />
          </button>
          <button className='bg-gradient-to-r from-[#1D9AF8] to-[#1279F0] text-white text-base font-medium px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center'>
            <Phone className='mr-2' size={20} />
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
