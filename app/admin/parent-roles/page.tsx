"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  ChalkboardTeacher,
  Users,
  Gear,
  ProjectorScreenChartIcon,
  SignOut,
} from "@phosphor-icons/react";
import StarField from "../../../components/ui/StarField";
import Loader from "../../../components/ui/Loader";
import { tokenUtils, adminAPI } from "../../../lib/api";

interface ParentRolesResponse {
  success: boolean;
  message: string;
  data: string[];
}

const roleIcons = {
  TUTORING: GraduationCap,
  PROJECTS_MAKER: ProjectorScreenChartIcon,
  COURSING: BookOpen,
  COACHING: ChalkboardTeacher,
};

const roleColors = {
  TUTORING: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  PROJECTS_MAKER: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  COURSING: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  COACHING: "from-orange-500/20 to-red-500/20 border-orange-500/30",
};

const roleDescriptions = {
  TUTORING: "Individual tutoring sessions for personalized learning",
  PROJECTS_MAKER: "Creative project development and implementation",
  COURSING: "Structured course delivery and curriculum development",
  COACHING: "Professional coaching and mentorship services",
};

export default function ParentRolesPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [parentRoles, setParentRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // التحقق من وجود token صالح
    if (!tokenUtils.isTokenValid()) {
      window.location.href = "/login";
      return;
    }
    fetchParentRoles();
  }, []);

  const fetchParentRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = (await adminAPI.getParentRoles()) as ParentRolesResponse;

      if (response.success) {
        setParentRoles(response.data);
      } else {
        setError("Failed to load parent roles");
      }
    } catch (err: unknown) {
      console.error("Error fetching parent roles:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (
        errorMessage.includes("Access token required") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401")
      ) {
        tokenUtils.removeToken();
        window.location.href = "/login";
        return;
      }

      setError(errorMessage || "Error loading parent roles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message='Loading parent roles...' />;
  }
  const handleLogout = () => {
    tokenUtils.removeToken();
    window.location.href = "/login";
  };

  return (
    <div
      className='relative min-h-screen h-full overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322]'
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}>
      {/* Custom SVG Background */}
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
      <header className='absolute top-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16 justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/admin'
                className='p-2 text-white hover:text-[#97beda] transition-colors'>
                <ArrowLeft size={24} />
              </Link>
              <Image
                src='/logoFikrTech.png'
                alt='FikrTech Logo'
                width={70}
                height={70}
              />
              <h1 className='text-xl font-bold text-white'>/Parent Roles</h1>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='text-white text-sm'>
                Total Roles:{" "}
                <span className='font-bold text-[#97beda]'>
                  {parentRoles.length}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-2 px-3 py-2 text-white hover:text-red-400 transition-colors'>
                <SignOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-20'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Title */}
          <div className='my-12 text-center'>
            <h2 className='text-3xl font-bold text-white mb-2'>
              Parent Roles Management
            </h2>
            <p className='text-[#97beda] text-lg'>
              Manage and view all parent roles available in the FikrTech
              platform.
            </p>
          </div>

          {error && (
            <div className='mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg'>
              <p className='text-red-400 mb-2'>{error}</p>
              <button
                onClick={fetchParentRoles}
                className='px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors'>
                Retry
              </button>
            </div>
          )}

          {parentRoles.length === 0 && !error ? (
            <div className='text-center py-12'>
              <Gear className='mx-auto text-gray-400 mb-4' size={64} />
              <p className='text-gray-400 text-lg mb-4'>
                No parent roles found
              </p>
              <button
                onClick={fetchParentRoles}
                className='px-6 py-3 bg-[#97beda]/20 hover:bg-[#97beda]/30 border border-[#97beda]/30 rounded-lg text-[#97beda] transition-colors'>
                Refresh
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {parentRoles.map((role, index) => {
                const IconComponent =
                  roleIcons[role as keyof typeof roleIcons] || Users;
                const colorClass =
                  roleColors[role as keyof typeof roleColors] ||
                  "from-gray-500/20 to-gray-600/20 border-gray-500/30";
                const description =
                  roleDescriptions[role as keyof typeof roleDescriptions] ||
                  "Educational service category";

                return (
                  <Link
                    key={role}
                    href={`/admin/parent-roles/${role.toLowerCase()}`}
                    className={`group relative bg-gradient-to-br ${colorClass} backdrop-blur-sm border rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer block`}>
                    {/* Card Number */}
                    <div className='absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-bold'>
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className='mb-4'>
                      <div className='w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                        <IconComponent className='text-white' size={32} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className='space-y-3'>
                      <div>
                        <h3 className='text-xl font-bold text-white mb-1'>
                          {role.replace("_", " ")}
                        </h3>
                      </div>

                      <p className='text-gray-300 text-sm leading-relaxed'>
                        {description}
                      </p>
                    </div>

                    {/* Hover Effect */}
                    <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl' />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Statistics 
          {parentRoles.length > 0 && (
            <div className='mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-xl font-bold text-white mb-4 text-center'>
                Parent Roles Statistics
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-[#97beda] mb-1'>
                    {parentRoles.length}
                  </div>
                  <div className='text-gray-400 text-sm'>Total Roles</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-400 mb-1'>
                    {parentRoles.filter((role) => role === "TUTORING").length}
                  </div>
                  <div className='text-gray-400 text-sm'>Tutoring</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-400 mb-1'>
                    {
                      parentRoles.filter((role) => role === "PROJECTS_MAKER")
                        .length
                    }
                  </div>
                  <div className='text-gray-400 text-sm'>Projects</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-400 mb-1'>
                    {
                      parentRoles.filter((role) => role.includes("COURS"))
                        .length
                    }
                  </div>
                  <div className='text-gray-400 text-sm'>Courses</div>
                </div>
              </div>
            </div>
          )}*/}
        </div>
      </div>

      {/* Bottom gradient transition */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20' />
    </div>
  );
}
