"use client";

import { useState, useEffect } from "react";

import StarField from "../../components/ui/StarField";
import Header from "@/components/Header";
import API_BASE_URL, { API_ENDPOINTS } from "@/lib/api";
import Footer from "@/components/Footer";

interface Plan {
  id: number;
  title: string;
  level: "SCHOOL" | "UNIVERSITY";
  mode: "ONLINE" | "OFFLINE";
  paidHours: number;
  freeSessions: number;
  totalHours: number;
  priceAED: number;
  effectiveRateAED: number;
  shortNote: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [levelFilter, setLevelFilter] = useState<"SCHOOL" | "UNIVERSITY">(
    "SCHOOL"
  );
  const [modeFilter, setModeFilter] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRICING.LIST}`); // ضع رابط الـ API الحقيقي
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data: Plan[] = await res.json();
        setPlans(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter(
    (p) => p.level === levelFilter && p.mode === modeFilter
  );

  return {
    plans,
    filteredPlans,
    levelFilter,
    modeFilter,
    loading,
    error,
    setLevelFilter,
    setModeFilter,
  };
}

export default function PricingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const {
    filteredPlans,
    levelFilter,
    modeFilter,
    loading,
    error,
    setLevelFilter,
    setModeFilter,
  } = usePlans();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className='relative min-h-screen overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322] '
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}>
      {/* Apply global styles to fix autofill background */}
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
      <Header pricingPage={true} />
      {/* Title */}
      <div className='relative z-10 flex flex-col items-center justify-center px-4 mt-36 mb-20'>
        <h1 className='text-white z-500 text-4xl font-bold pb-4'>
          Our Packages
        </h1>
        <p className='text-[#97beda] text-lg'>
          Choose the perfect package for your needs
        </p>

        {/* Toggle Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 mt-8'>
          {/* Level Filter */}
          <div className='flex flex-col items-center'>
            <div className='flex bg-gray-800 rounded-lg p-1'>
              <button
                onClick={() => setLevelFilter("SCHOOL")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  levelFilter === "SCHOOL"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}>
                School
              </button>
              <button
                onClick={() => setLevelFilter("UNIVERSITY")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  levelFilter === "UNIVERSITY"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}>
                University
              </button>
            </div>
          </div>

          {/* Mode Filter */}
          <div className='flex flex-col items-center'>
            <div className='flex bg-gray-800 rounded-lg p-1'>
              <button
                onClick={() => setModeFilter("ONLINE")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  modeFilter === "ONLINE"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}>
                Online
              </button>
              <button
                onClick={() => setModeFilter("OFFLINE")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  modeFilter === "OFFLINE"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}>
                Offline
              </button>
            </div>
          </div>
        </div>
      </div>
      <section>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden'>
          <div className='text-center mb-12'></div>

          {/* Loading State */}
          {loading && (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
              <span className='ml-4 text-white'>Loading packages...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='flex justify-center items-center py-12'>
              <div className='text-red-400 text-center'>
                <p>Error loading packages: {error}</p>
                <p className='text-sm mt-2'>Using sample data</p>
              </div>
            </div>
          )}

          {/* Packages Grid */}
          {!loading && (
            <div className='grid rounded-lg grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-20 '>
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan, index) => (
                  /* Package id 2 is recommended */
                  <div
                    key={plan.id}
                    className={`bg-gray-800  flex flex-col justify-start items-start rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300 relative ${
                      index === 1
                        ? "border-2 border-transparent rounded-lg [border-image:linear-gradient(to_right,#1279f0,#1d9af8)_1]"
                        : ""
                    }`}>
                    {/* Package id 2 is recommended */}
                    <div className=' flex flex-col w-full justify-start items-start mb-8  rounded-lg '>
                      {index === 1 && (
                        <div className='absolute rounded-lg -top-3 left-1/2 transform -translate-x-1/2'>
                          <span className='bg-gradient-to-r from-[#1279f0] to-[#1d9af8] text-white px-3 py-1 rounded-full text-sm font-bold'>
                            Recommended
                          </span>
                        </div>
                      )}

                      {/* Package title */}
                      <h3 className='text-3xl  text-white pt-4 pb-1'>
                        {plan.title}
                      </h3>

                      {/* Package short note */}
                      <p className=' text-gray-400 text-base'>
                        {plan.shortNote}
                      </p>

                      {/* Package level and mode tags 
                      <div className='mt-2 flex gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.level === "SCHOOL"
                              ? "bg-gray-400/80 text-white"
                              : "bg-gray-400/80 text-white"
                          }`}>
                          {plan.level}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.mode === "ONLINE"
                              ? "bg-gray-400/80 text-white"
                              : "bg-gray-400/80 text-white"
                          }`}>
                          {plan.mode}
                        </span>
                      </div>
                      */}
                    </div>

                    {/* Package price */}
                    <div className='mb-8'>
                      <span className='text-3xl font-extrabold bg-[#ffffff] text-transparent bg-clip-text'>
                        {plan.priceAED === 0
                          ? "Free"
                          : `${plan.priceAED.toLocaleString()} `}
                      </span>
                      <span className='text-xl text-white font-extrabold'>
                        AED
                      </span>
                      {plan.priceAED > 0 && (
                        <span className='text-sm font-medium text-gray-400'>
                          /pk
                        </span>
                      )}
                    </div>
                    {index !== 1 && (
                      <a
                        href='#'
                        className='block w-full rounded-full py-3 px-6 mb-4 text-center  text-white font-medium bg-transparent border-2 border-[#1279f0]  hover:bg-[#1279f0] transition-all duration-300'>
                        {plan.priceAED === 0 ? "Sign Up" : "Get Started"}
                      </a>
                    )}
                    {index === 1 && (
                      <a
                        href='#'
                        className='block w-full rounded-full py-3 px-6 mb-4 text-center text-white font-medium bg-[#1279f0]  hover:bg-[#1d9af8] transition-all duration-300'>
                        {plan.priceAED === 0 ? "Sign Up" : "Get Started"}
                      </a>
                    )}

                    {/* Package features */}
                    <div className='flex flex-col justify-start items-start w-full'>
                      <span className='text-white text-sm font-medium'>
                        Features :
                      </span>
                    </div>
                    <ul className='mt-2 space-y-2 text-gray-400'>
                      {plan.effectiveRateAED > 0 && (
                        <li className='flex items-center'>
                          <svg
                            className='h-4 w-4 text-green-500 mr-2'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          <span className='font-semibold'>
                            {plan.effectiveRateAED.toFixed(2)} AED/hour
                          </span>
                        </li>
                      )}
                      <li className='flex items-center'>
                        <svg
                          className='h-4 w-4 text-green-500 mr-2'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        <span>{plan.totalHours} total hours</span>
                      </li>
                      <li className='flex items-center'>
                        <svg
                          className='h-4 w-4 text-green-500 mr-2'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        <span>{plan.freeSessions} free sessions</span>
                      </li>
                      <li className='flex items-center'>
                        <svg
                          className='h-4 w-4 text-green-500 mr-2'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        <span>{plan.paidHours} paid hours</span>
                      </li>
                    </ul>

                    {/* Package button */}
                  </div>
                ))
              ) : (
                <div className='col-span-full text-center py-12'>
                  <p className='text-gray-400 text-lg'>
                    No packages found for the selected filters.
                  </p>
                  <p className='text-gray-500 text-sm mt-2'>
                    Try changing the level or mode filters above.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer pricingPage={true} />
    </div>
  );
}
