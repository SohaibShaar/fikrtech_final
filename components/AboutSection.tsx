"use client";

import React from "react";
import { CheckCircle, Users, Lightbulb, Target } from "@phosphor-icons/react";

interface AboutSectionProps {
  children?: React.ReactNode;
}

const AboutSection = ({ children }: AboutSectionProps) => {
  const features = [
    {
      icon: <Users size={32} weight='fill' />,
      title: "Private Online Community",
      description:
        "Join thousands of learners and experts sharing knowledge together",
    },
    {
      icon: <Lightbulb size={32} weight='fill' />,
      title: "Micro Courses",
      description:
        "Stay ahead with cutting-edge technologies and methodologies",
    },
    {
      icon: <Target size={32} weight='fill' />,
      title: "ADHD/Dyslexia Tutoring",
      description:
        "Structured learning paths to achieve your professional objectives",
    },
    {
      icon: <CheckCircle size={32} weight='fill' />,
      title: "Educator Monetization Tools",
      description: "Curated content reviewed by industry professionals",
    },
  ];

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Gradient Background with smooth transition from Hero */}
      <div className='absolute inset-0 bg-gradient-to-b from-[#041322] via-[#0a1a2e] to-[#16213e]' />

      {/* Animated background elements */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: "1s" }}
        />
        <div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className='relative z-10 container mx-auto px-4 py-20'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6'>
            About{" "}
            <span className='bg-gradient-to-r from-[#36FFFF] to-[#1D9AF8] bg-clip-text text-transparent'>
              FikrTech
            </span>
          </h2>
          <p className='text-gray-300 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed'>
            We`re building the future of learning through technology, community,
            and innovation. Join us on a journey where knowledge transforms into
            real-world impact.
          </p>
        </div>

        {/* Features Grid */}
        <div className='flex justify-center mb-16'>
          <div className='grid grid-cols-2 gap-8 max-w-4xl'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='group relative p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105'>
                {/* Gradient border on hover */}
                <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#36FFFF]/20 to-[#1D9AF8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />

                <div className='text-[#36FFFF] mb-4 group-hover:scale-103 transition-transform duration-300'>
                  {feature.icon}
                </div>
                <h3 className='text-white text-xl font-semibold mb-3'>
                  {feature.title}
                </h3>
                <p className='text-gray-300 text-sm leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className='text-center'>
          <div className='inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/20'>
            <div>
              <h3 className='text-white text-2xl md:text-3xl font-bold mb-4'>
                Ready to Start Your Journey?
              </h3>
              <p className='text-gray-300 text-lg mb-6 max-w-2xl'>
                Join thousands of learners who are already transforming their
                careers with Fikrtech
              </p>
              <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                <button className='bg-gradient-to-r from-[#1d9af8] to-[#1279F0] text-[#FCFEFC] font-semibold px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105'>
                  Join Community
                </button>
                <button className='bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-lg hover:bg-white/20 transition-all duration-300'>
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient transition */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#1a2332]' />

      {children}
    </div>
  );
};

export default AboutSection;
