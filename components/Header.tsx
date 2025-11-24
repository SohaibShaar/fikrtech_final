/* eslint-disable @next/next/no-img-element */
"use client";

import { Phone } from "@phosphor-icons/react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { adminAPI, authAPI, tokenUtils, studentFormAPI } from "../lib/api";

interface UserResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName?: string;
      [key: string]: unknown;
    };
  };
}

interface TutoringCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  children?: TutoringCategory[];
}

const Header = ({ pricingPage = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTutoringDropdownOpen, setIsTutoringDropdownOpen] = useState(false);
  const [isOurTutorSubmenuOpen, setIsOurTutorSubmenuOpen] = useState(false);
  const [tutoringCategories, setTutoringCategories] = useState<
    TutoringCategory[]
  >([]);
  const [studentSelectedCategories, setStudentSelectedCategories] = useState<
    TutoringCategory[]
  >([]);
  const [parentRoles, setParentRoles] = useState<string[]>([]);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    id: string;
    email: string;
    role: string;
    fullName: string;
  } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTutoringDropdown = () => {
    setIsTutoringDropdownOpen(!isTutoringDropdownOpen);
  };

  const checkUserAuthorization = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Checking user authorization...");

      // Check if token is valid before making the API call
      if (!tokenUtils.isTokenValid()) {
        console.log("No valid token found, redirecting to login");
        tokenUtils.removeToken();
        window.location.href = "/login";
        return;
      }

      const response = (await adminAPI.getCurrentUser()) as UserResponse;
      console.log("User response:", response);

      if (response.success && response.data) {
        const user = response.data;
        console.log("User data:", user);
        setUserInfo({
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.profile?.fullName || user.email.split("@")[0],
        });

        if (user.role === "ADMIN") {
          console.log("User is ADMIN, loading dashboard...");
          setIsAuthorized(true);
          // إذا كان المستخدم admin، قم بجلب إحصائيات لوحة التحكم
        } else {
          console.log("User is not ADMIN, role:", user.role);
          setIsAuthorized(false);
        }
      } else {
        console.log("Failed to get user data, redirecting to login");
        // فشل في الحصول على معلومات المستخدم
        tokenUtils.removeToken();
        window.location.href = "/login";
      }
    } catch (err: unknown) {
      console.error("Error checking user authorization:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (
        errorMessage.includes("Authentication failed") ||
        errorMessage.includes("Access token required") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Invalid or expired token") ||
        errorMessage.includes("No authentication token found")
      ) {
        console.log("Authentication error, redirecting to login");
        tokenUtils.clearAuth();
        window.location.href = "/login";
      } else {
        console.log("Other error, setting unauthorized");
        setError(errorMessage);
        setIsAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // التحقق من وجود token صالح
    if (!tokenUtils.isTokenValid()) {
      // إعادة توجيه لصفحة تسجيل الدخول إذا لم يكن هناك token
      console.log("No valid token found, skipping authorization check");
      return;
    }
    checkUserAuthorization();
  }, [checkUserAuthorization]);

  const handleLogout = () => {
    tokenUtils.clearAuth();
    window.location.href = "/login";
  };

  // Fetch tutoring categories
  useEffect(() => {
    const fetchTutoringCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await authAPI.getTutoringCategories()) as {
          success: boolean;
          data: TutoringCategory[];
        };

        if (response.success && response.data) {
          setTutoringCategories(response.data);
        } else {
          // Silently handle - categories are optional for the header
          setTutoringCategories([]);
        }
      } catch {
        // Silently handle errors - categories are optional for navigation
        // The header should work fine even without categories
        setTutoringCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutoringCategories();
  }, []);

  // Fetch parent roles
  useEffect(() => {
    const fetchParentRoles = async () => {
      try {
        // Only fetch if user has valid token (for authenticated endpoints)
        if (!tokenUtils.isTokenValid()) {
          return;
        }

        const response = (await adminAPI.getParentRoles()) as {
          success: boolean;
          data: string[];
        };

        if (response.success && response.data) {
          setParentRoles(response.data);
        } else {
          setParentRoles([]);
        }
      } catch {
        // Silently handle errors - parent roles are optional
        setParentRoles([]);
      }
    };

    fetchParentRoles();
  }, []);

  // Fetch student selected categories
  useEffect(() => {
    const fetchStudentCategories = async () => {
      // Only fetch if user is logged in and has a valid token
      if (!tokenUtils.isTokenValid() || !userInfo) {
        return;
      }

      // Only fetch for students (not admins)
      if (userInfo.role === "ADMIN") {
        return;
      }

      try {
        const response = (await studentFormAPI.getFormProgress()) as {
          success: boolean;
          data?: {
            selectedCategories?: string;
          };
        };

        if (response.success && response.data?.selectedCategories) {
          try {
            const selectedCategoryIds = JSON.parse(
              response.data.selectedCategories
            ) as string[];

            // Match selected category IDs with tutoring categories
            const matchedCategories = tutoringCategories.filter((category) =>
              selectedCategoryIds.includes(category.id)
            );

            setStudentSelectedCategories(matchedCategories);
          } catch (parseError) {
            console.error("Error parsing selected categories:", parseError);
            setStudentSelectedCategories([]);
          }
        } else {
          setStudentSelectedCategories([]);
        }
      } catch {
        // Silently handle errors - student categories are optional
        setStudentSelectedCategories([]);
      }
    };

    // Only fetch if we have tutoring categories loaded
    if (tutoringCategories.length > 0 && userInfo) {
      fetchStudentCategories();
    }
  }, [tutoringCategories, userInfo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  // Filter out categories that are already in student selected categories
  const filteredTutoringCategories = useMemo(() => {
    return tutoringCategories.filter(
      (category) =>
        !studentSelectedCategories.some(
          (selected) => selected.id === category.id
        )
    );
  }, [tutoringCategories, studentSelectedCategories]);

  const contactUsBtn = {
    text: "Contact Us",
  };

  return (
    <header className='absolute top-0 left-0 right-0 z-20 bg-transparent py-4 z-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center h-16 relative'>
          {/* Logo - Left */}
          <div className='flex-shrink-0'>
            <img src='/logoFikrTech.png' alt='Logo' width={100} height={100} />
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className='hidden md:flex space-x-4 absolute left-1/2 transform -translate-x-1/2'>
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
                <div className='absolute top-full left-0 pt-1 z-50'>
                  <div className='bg-white rounded-md shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto w-72'>
                    <div
                      className='flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200 group'
                      onMouseEnter={() => {
                        if (submenuTimeoutRef.current) {
                          clearTimeout(submenuTimeoutRef.current);
                          submenuTimeoutRef.current = null;
                        }
                        setIsOurTutorSubmenuOpen(true);
                      }}
                      onMouseLeave={() => {
                        if (submenuTimeoutRef.current) {
                          clearTimeout(submenuTimeoutRef.current);
                        }
                        submenuTimeoutRef.current = setTimeout(() => {
                          setIsOurTutorSubmenuOpen(false);
                        }, 300);
                      }}>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900 cursor-pointer group-hover:text-[#97beda] transition-colors duration-200'>
                          Our Tutor
                        </div>
                      </div>
                      {(studentSelectedCategories.length > 0 ||
                        filteredTutoringCategories.length > 0 ||
                        parentRoles.length > 0) && (
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isOurTutorSubmenuOpen ? "rotate-90" : ""
                          }`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      )}
                    </div>
                    <div className='flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200 group'>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900 cursor-pointer group-hover:text-[#97beda] transition-colors duration-200'>
                          Tutoring for university students
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200 group'>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900 cursor-pointer group-hover:text-[#97beda] transition-colors duration-200'>
                          Tutoring for assignment help
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Invisible bridge to prevent gap between menu and submenu */}
                  {isOurTutorSubmenuOpen &&
                    (studentSelectedCategories.length > 0 ||
                      filteredTutoringCategories.length > 0 ||
                      parentRoles.length > 0) && (
                      <div
                        className='absolute left-full top-[8px] w-1 h-[48px] z-[55]'
                        onMouseEnter={() => {
                          if (submenuTimeoutRef.current) {
                            clearTimeout(submenuTimeoutRef.current);
                            submenuTimeoutRef.current = null;
                          }
                          setIsOurTutorSubmenuOpen(true);
                        }}
                      />
                    )}
                  {/* Submenu outside the scrollable container */}
                  {isOurTutorSubmenuOpen &&
                    (studentSelectedCategories.length > 0 ||
                      filteredTutoringCategories.length > 0 ||
                      parentRoles.length > 0) && (
                      <div
                        className='absolute left-full top-[8px] ml-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-[60] max-h-96 overflow-y-auto'
                        onMouseEnter={() => {
                          if (submenuTimeoutRef.current) {
                            clearTimeout(submenuTimeoutRef.current);
                            submenuTimeoutRef.current = null;
                          }
                          setIsOurTutorSubmenuOpen(true);
                        }}
                        onMouseLeave={() => {
                          if (submenuTimeoutRef.current) {
                            clearTimeout(submenuTimeoutRef.current);
                          }
                          submenuTimeoutRef.current = setTimeout(() => {
                            setIsOurTutorSubmenuOpen(false);
                          }, 200);
                        }}>
                        {/* Student Selected Categories Section */}
                        {studentSelectedCategories.length > 0 && (
                          <>
                            <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200'>
                              Tutors For Me
                            </div>
                            {studentSelectedCategories.map((category) => (
                              <div
                                key={category.id}
                                className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200'>
                                <div className='font-medium text-gray-900 hover:text-[#97beda] transition-colors duration-200'>
                                  {category.name}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        {/* Category Section - Filter out categories already shown in "Tutors For Me" */}
                        {filteredTutoringCategories.length > 0 && (
                          <>
                            {studentSelectedCategories.length > 0 && (
                              <div className='px-4 py-2 border-t border-gray-200'></div>
                            )}
                            <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200'>
                              All Tutors
                            </div>
                            {filteredTutoringCategories.map((category) => (
                              <div
                                key={category.id}
                                className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200'>
                                <div className='font-medium text-gray-900 hover:text-[#97beda] transition-colors duration-200'>
                                  {category.name}
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        {/* Parent Role Section */}
                        {parentRoles.length > 0 && (
                          <>
                            {(filteredTutoringCategories.length > 0 ||
                              studentSelectedCategories.length > 0) && (
                              <div className='px-4 py-2 border-t border-gray-200'></div>
                            )}
                            <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200'>
                              Parent Role
                            </div>
                            {parentRoles.map((role, index) => (
                              <a
                                key={index}
                                href={`/admin/parent-roles/${role.toLowerCase()}`}
                                className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#97beda] transition-colors duration-200'>
                                <div className='font-medium text-gray-900 hover:text-[#97beda] transition-colors duration-200'>
                                  {role.replace(/_/g, " ")}
                                </div>
                              </a>
                            ))}
                          </>
                        )}
                      </div>
                    )}
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
                                      (await authAPI.getTutoringCategories()) as {
                                        success: boolean;
                                        data: TutoringCategory[];
                                      };

                                    if (response.success && response.data) {
                                      setTutoringCategories(response.data);
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
            <a
              href='/pricing'
              className={` hover:text-[#97beda] px-3 py-2 text-md font-medium transition-colors duration-200 ${
                pricingPage ? "text-blue-300" : "text-white"
              }`}>
              Pricing
            </a>
            <a
              href='/courses'
              className='text-white hover:text-[#97beda] px-3 py-2 text-md font-medium transition-colors duration-200'>
              Courses
            </a>
          </nav>

          {!userInfo ? (
            /* Contact Us Button - Right */
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
                {contactUsBtn.text}
              </button>
            </div>
          ) : userInfo && isAuthorized === true ? (
            <div className='hidden md:flex items-center ml-auto'>
              <a
                href='/admin'
                className='text-white inline-block cursor-pointer hover:text-[#97beda] transition-colors duration-200'>
                Admin
              </a>
              <span className='text-white inline-block mx-2'>|</span>
              <a
                href='/admin/courses'
                className='text-white inline-block cursor-pointer hover:text-[#97beda] transition-colors duration-200'>
                Courses
              </a>
              <span className='text-white inline-block mx-2'>|</span>
              <a
                onClick={handleLogout}
                className='text-white inline-block cursor-pointer mr-4 hover:text-[#97beda] transition-colors duration-200'>
                Logout
              </a>
              <button className='bg-white/10 group backdrop-blur-sm border border-white/20 px-4 py-2  text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium shadow-lg'>
                <Phone size={20} className='text-white inline mr-4' />
                {contactUsBtn.text}
              </button>
            </div>
          ) : userInfo && userInfo.role === "TEACHER" ? (
            <div className='hidden md:flex items-center ml-auto'>
              <a
                href='/teacher/profile'
                className='text-white inline-block cursor-pointer hover:text-[#97beda] transition-colors duration-200'>
                My Profile
              </a>
              <span className='text-white inline-block mx-2'>|</span>
              <a
                href='/teacher/courses'
                className='text-white inline-block cursor-pointer hover:text-[#97beda] transition-colors duration-200'>
                My Courses
              </a>
              <span className='text-white inline-block mx-2'>|</span>
              <a
                onClick={handleLogout}
                className='text-white inline-block cursor-pointer mr-4 hover:text-[#97beda] transition-colors duration-200'>
                Logout
              </a>
              <button className='bg-white/10 group backdrop-blur-sm border border-white/20 px-4 py-2  text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium shadow-lg'>
                <Phone size={20} className='text-white inline mr-4' />
                {contactUsBtn.text}
              </button>
            </div>
          ) : (
            <div className='hidden md:flex items-center ml-auto'>
              <a
                onClick={handleLogout}
                className='text-white inline-block cursor-pointer mr-4 hover:text-[#97beda] transition-colors duration-200'>
                Logout
              </a>
              <button className='bg-white/10 group backdrop-blur-sm border border-white/20 px-4 py-2  text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium shadow-lg'>
                <Phone size={20} className='text-white inline mr-4' />
                {contactUsBtn.text}
              </button>
            </div>
          )}

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
                                    (await authAPI.getTutoringCategories()) as {
                                      success: boolean;
                                      data: TutoringCategory[];
                                    };

                                  if (response.success && response.data) {
                                    setTutoringCategories(response.data);
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
              {contactUsBtn.text}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
