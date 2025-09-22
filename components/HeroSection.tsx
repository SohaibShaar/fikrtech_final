"use client";

import { ArrowRight, Star } from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import StarField from "../components/ui/StarField";

interface HeroSectionProps {
  children?: React.ReactNode;
}

const HeroSection = ({ children }: HeroSectionProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts with longer delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 0); // زيادة التأخير إلى ثانية واحدة

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='relative min-h-screen overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322]'>
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

      {/* Hero Section Content
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
      </div> */}
      {/* Sparkles */}
      <div className='min-h-screen w-full bg-transparent flex flex-col items-center justify-center overflow-hidden rounded-md'>
        <h1 className='md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20'>
          FikrTech
        </h1>
        <div className='w-[40rem] h-40 relative'>
          {/* Button positioned above sparkles */}

          <div className='absolute flex inset-0 items-center justify-center z-30'>
            <div className='flex flex-col items-center justify-center pt-7'>
              <p className='text-[#97beda] text-md md:text-xl lg:text-2xl my-3'>
                Where Knowledge Meets Community
              </p>
              <div className='flex flex-col items-center justify-center gap-4'>
                <div className='flex items-center justify-center gap-1'>
                  <Star size={15} weight='fill' className='text-[#F0B100]' />
                  <Star size={15} weight='fill' className='text-[#F0B100]' />
                  <Star size={15} weight='fill' className='text-[#F0B100]' />
                  <Star size={15} weight='fill' className='text-[#F0B100]' />
                  <Star size={15} weight='fill' className='text-[#F0B100]' />
                  <p className='text-gray-500 text-sm mx-2'>Rated 4.9/5.0</p>
                </div>{" "}
                <button className='bg-white/10 group backdrop-blur-sm border border-white/20 text-white px-6 py-3 mt-4 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium shadow-lg'>
                  Get Started{" "}
                  <ArrowRight
                    className='ml-2 inline-block transform transition-transform duration-300 group-hover:translate-x-1'
                    size={20}
                  />
                </button>
              </div>
            </div>
          </div>
          {/* Gradients */}
          <div className='absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm' />
          <div className='absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4' />
          <div className='absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm' />
          <div className='absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4' />

          {/* Core component with radial gradient mask */}
          <div
            className='relative w-full h-full'
            style={{
              mask: `radial-gradient(ellipse 60% 100% at 50% 0%, white 0%, white 30%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.1) 85%, transparent 100%)`,
              WebkitMask: `radial-gradient(ellipse 60% 100% at 50% 0%, white 0%, white 30%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.1) 85%, transparent 100%)`,
            }}>
            {/*
            <SparklesCore
              background='transparent'
              minSize={0.4}
              maxSize={1}
              particleDensity={800}
              className='w-full h-full bg-transparent rounded-full z-0'
              particleColor='#FFFFFF'
            />*/}
          </div>

          {/* Additional radial gradient to enhance the effect */}
        </div>
      </div>

      {/* Simple Scroll Down Indicator */}
      <div className='absolute bottom-8 flex flex-col items-center left-1/2 transform -translate-x-1/2 z-30'>
        <span className='text-white/50 text-sm mb-2'>Scroll Down</span>
        <div className='w-6 h-10 border-2 border-white/30 rounded-full flex justify-center'>
          <div
            className='w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce'
            style={{ animationDuration: "2s" }}></div>
        </div>
      </div>

      {/* Bottom gradient transition to next section */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20' />
    </div>
  );
};

export default HeroSection;
