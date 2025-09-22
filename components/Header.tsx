/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTutoringDropdownOpen, setIsTutoringDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTutoringDropdown = () => {
    setIsTutoringDropdownOpen(!isTutoringDropdownOpen);
  };

  return (
    <header className='absolute top-0 left-0 right-0 z-20 bg-transparent py-3'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo - Left */}
          <div className='flex-shrink-0'>
            <img src='/logoFikrTech.png' alt='Logo' width={100} height={100} />
          </div>

          {/* Desktop Navigation - Center */}
          <nav className='hidden md:flex space-x-8'>
            {/* Tutoring with Dropdown */}
            <div
              className='relative'
              onMouseEnter={() => setIsTutoringDropdownOpen(true)}
              onMouseLeave={() => setIsTutoringDropdownOpen(false)}>
              <button className='flex items-center text-white hover:text-[#97beda] px-3 py-2 text-sm font-medium transition-colors duration-200'>
                Tutoring
                <svg
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    isTutoringDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isTutoringDropdownOpen && (
                <div className='absolute top-full left-0 pt-1 w-64 z-20'>
                  <div className='bg-white rounded-md shadow-lg border border-gray-200 py-2'>
                    <a
                      href='#'
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200'>
                      <svg
                        className='w-4 h-4 mr-3 text-blue-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                        />
                      </svg>
                      For University Students
                    </a>
                    <a
                      href='#'
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200'>
                      <svg
                        className='w-4 h-4 mr-3 text-blue-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                      For Assignment and Project Helps
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href='#'
              className='text-white hover:text-[#97beda] px-3 py-2 text-sm font-medium transition-colors duration-200'>
              Teaching
            </a>
            <a
              href='#'
              className='text-white hover:text-[#97beda] px-3 py-2 text-sm font-medium transition-colors duration-200'>
              Courses
            </a>
            <a
              href='#'
              className='text-white hover:text-[#97beda] px-3 py-2 text-sm font-medium transition-colors duration-200'>
              Coaching
            </a>
          </nav>

          {/* Contact Us Button - Right */}
          <div className='hidden md:block'>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm'>
              Contact Us
            </button>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMobileMenu}
              className='text-gray-700 hover:text-[#97beda] focus:outline-none focus:text-blue-600'>
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden bg-white border-t border-gray-200 absolute top-full left-0 right-0 z-10'>
          <div className='px-2 pt-2 pb-3 space-y-1'>
            {/* Mobile Tutoring */}
            <div>
              <button
                onClick={toggleTutoringDropdown}
                className='flex items-center justify-between w-full text-left text-gray-700 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-base font-medium rounded-md transition-colors duration-200'>
                Tutoring
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isTutoringDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
              {isTutoringDropdownOpen && (
                <div className='ml-4 space-y-1'>
                  <a
                    href='#'
                    className='flex items-center text-gray-600 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-sm rounded-md transition-colors duration-200'>
                    <svg
                      className='w-4 h-4 mr-3 text-blue-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                      />
                    </svg>
                    For University Students
                  </a>
                  <a
                    href='#'
                    className='flex items-center text-gray-600 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-sm rounded-md transition-colors duration-200'>
                    <svg
                      className='w-4 h-4 mr-3 text-blue-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    For Assignment and Project Helps
                  </a>
                </div>
              )}
            </div>

            <a
              href='#'
              className='block text-gray-700 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-base font-medium rounded-md transition-colors duration-200'>
              Teaching
            </a>
            <a
              href='#'
              className='block text-gray-700 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-base font-medium rounded-md transition-colors duration-200'>
              Courses
            </a>
            <a
              href='#'
              className='block text-gray-700 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-base font-medium rounded-md transition-colors duration-200'>
              Coaching
            </a>
            <button className='w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 mt-2'>
              Contact Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
