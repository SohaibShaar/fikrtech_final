/* eslint-disable @next/next/no-img-element */
"use client";

import { Phone } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { adminAPI } from "../lib/api";

interface TutoringCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  children?: TutoringCategory[];
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTutoringDropdownOpen, setIsTutoringDropdownOpen] = useState(false);
  const [tutoringCategories, setTutoringCategories] = useState<
    TutoringCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTutoringDropdown = () => {
    setIsTutoringDropdownOpen(!isTutoringDropdownOpen);
  };

  // Fetch tutoring categories
  useEffect(() => {
    const fetchTutoringCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await adminAPI.getParentsByRole(
          "TUTORING",
          false
        )) as {
          success: boolean;
          data: TutoringCategory[];
        };

        if (response.success && response.data) {
          // Filter only active categories
          const activeCategories = response.data.filter(
            (category) => category.isActive
          );
          setTutoringCategories(activeCategories);
        } else {
          setError("Failed to load categories");
          setTutoringCategories([]);
        }
      } catch (error) {
        console.error("Error fetching tutoring categories:", error);
        setError("Network error occurred");
        // Fallback to empty array
        setTutoringCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutoringCategories();
  }, []);

  return (
    <header className='absolute top-0 left-0 right-0 z-20 bg-transparent py-4 z-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center h-16 relative'>
          {/* Logo - Left */}
          <div className='flex-shrink-0'>
            <img src='/logoFikrTech.png' alt='Logo' width={100} height={100} />
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className='hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2'>
            {/* Tutoring with Dropdown */}
            <div
              className='relative'
              onMouseEnter={() => setIsTutoringDropdownOpen(true)}
              onMouseLeave={() => setIsTutoringDropdownOpen(false)}>
              <button className='flex items-center text-white hover:text-[#97beda] px-3 py-2 text-md font-medium transition-colors duration-200'>
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

              {isTutoringDropdownOpen && (
                <div className='absolute top-full left-0 pt-1 w-72 z-50'>
                  <div className='bg-white rounded-md shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto'>
                    <div className='flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200 group'>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900 cursor-pointer group-hover:text-[#97beda] transition-colors duration-200'>
                          Tutoring for university students
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Dropdown Menu 

              
              {isTutoringDropdownOpen && (
                <div className='absolute top-full left-0 pt-1 w-72 z-50'>
                  <div className='bg-white rounded-md shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto'>
                    {loading ? (
                      <div className='flex items-center justify-center px-4 py-3'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#97beda]'></div>
                        <span className='ml-2 text-sm text-gray-600'>
                          Loading...
                        </span>
                      </div>
                    ) : tutoringCategories.length > 0 ? (
                      tutoringCategories.map((category) => (
                        <a
                          key={category.id}
                          href={`/tutoring/${category.id}`}
                          className='flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200 group'>
                          <div className='flex-1'>
                            <div className='font-medium text-gray-900 group-hover:text-[#97beda] transition-colors duration-200'>
                              {category.name}
                            </div>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className='flex items-center justify-center px-4 py-6 text-gray-500'>
                        <div className='text-center'>
                          <div
                            className={`text-sm ${
                              error ? "text-red-500" : ""
                            }`}>
                            {error || "No tutoring categories available"}
                          </div>
                          {error && (
                            <button
                              onClick={() => {
                                setError(null);
                                // Trigger refetch
                                const fetchTutoringCategories = async () => {
                                  try {
                                    setLoading(true);
                                    setError(null);
                                    const response =
                                      (await adminAPI.getParentsByRole(
                                        "TUTORING",
                                        false
                                      )) as {
                                        success: boolean;
                                        data: TutoringCategory[];
                                      };

                                    if (response.success && response.data) {
                                      const activeCategories =
                                        response.data.filter(
                                          (category) => category.isActive
                                        );
                                      setTutoringCategories(activeCategories);
                                    } else {
                                      setError("Failed to load categories");
                                      setTutoringCategories([]);
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error fetching tutoring categories:",
                                      error
                                    );
                                    setError("Network error occurred");
                                    setTutoringCategories([]);
                                  } finally {
                                    setLoading(false);
                                  }
                                };
                                fetchTutoringCategories();
                              }}
                              className='mt-2 text-xs text-blue-600 hover:text-blue-800 underline'>
                              Try again
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    <a className='flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200 group'>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900 cursor-pointer group-hover:text-[#97beda] transition-colors duration-200'>
                          Tutoring for university students
                        </div>
                      </div>
                    </a>
                    <a className='flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200 group'>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900 cursor-pointer group-hover:text-[#97beda] transition-colors duration-200'>
                          Tutoring for project helps
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}*/}
            </div>

            <a
              href='#'
              className='text-white hover:text-[#97beda] px-3 py-2 text-md font-medium transition-colors duration-200'>
              Teaching
            </a>
            <a
              href='#'
              className='text-white hover:text-[#97beda] px-3 py-2 text-md font-medium transition-colors duration-200'>
              Courses
            </a>
            <a
              href='#'
              className='text-white hover:text-[#97beda] px-3 py-2 text-md font-medium transition-colors duration-200'>
              Coaching
            </a>
          </nav>

          {/* Contact Us Button - Right */}
          <div className='hidden md:flex items-center ml-auto'>
            <a
              href='/login'
              className='text-white inline-block cursor-pointer hover:text-[#97beda] transition-colors duration-200'>
              Login
            </a>
            <span className='text-white inline-block mx-2'>|</span>
            <a
              href='/register'
              className='text-white inline-block mr-4 cursor-pointer hover:text-[#97beda] transition-colors duration-200'>
              Register
            </a>
            <button className='bg-white/10 group backdrop-blur-sm border border-white/20 px-4 py-2  text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium shadow-lg'>
              <Phone size={20} className='text-white inline mr-4' />
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
                <div className='ml-4 space-y-1 max-h-64 overflow-y-auto'>
                  {loading ? (
                    <div className='flex items-center justify-center px-3 py-3'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-[#97beda]'></div>
                      <span className='ml-2 text-sm text-gray-600'>
                        Loading...
                      </span>
                    </div>
                  ) : tutoringCategories.length > 0 ? (
                    tutoringCategories.map((category) => (
                      <a
                        key={category.id}
                        href={`/tutoring/${category.id}`}
                        className='flex items-center text-gray-600 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-sm rounded-md transition-colors duration-200 group'>
                        <svg
                          className='w-4 h-4 mr-3 text-blue-500 group-hover:text-[#97beda] transition-colors duration-200'
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
                        <div className='flex-1'>
                          <div className='font-medium'>{category.name}</div>
                          {category.children &&
                            category.children.length > 0 && (
                              <div className='text-xs text-gray-500'>
                                {category.children.length} subcategories
                              </div>
                            )}
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className='flex items-center justify-center px-3 py-4 text-gray-500'>
                      <div className='text-center'>
                        <div
                          className={`text-sm ${error ? "text-red-500" : ""}`}>
                          {error || "No categories available"}
                        </div>
                        {error && (
                          <button
                            onClick={() => {
                              setError(null);
                              // Trigger refetch (same logic as above)
                              const fetchTutoringCategories = async () => {
                                try {
                                  setLoading(true);
                                  setError(null);
                                  const response =
                                    (await adminAPI.getParentsByRole(
                                      "TUTORING",
                                      false
                                    )) as {
                                      success: boolean;
                                      data: TutoringCategory[];
                                    };

                                  if (response.success && response.data) {
                                    const activeCategories =
                                      response.data.filter(
                                        (category) => category.isActive
                                      );
                                    setTutoringCategories(activeCategories);
                                  } else {
                                    setError("Failed to load categories");
                                    setTutoringCategories([]);
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error fetching tutoring categories:",
                                    error
                                  );
                                  setError("Network error occurred");
                                  setTutoringCategories([]);
                                } finally {
                                  setLoading(false);
                                }
                              };
                              fetchTutoringCategories();
                            }}
                            className='mt-2 text-xs text-blue-600 hover:text-blue-800 underline'>
                            Try again
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <a
              href='#'
              className='block text-gray-700 hover:text-[#97beda] hover:bg-blue-50 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200'>
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
