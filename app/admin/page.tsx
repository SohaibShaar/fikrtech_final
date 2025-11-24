"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  SignOut,
  Bell,
  MagnifyingGlass,
  Student,
  ChalkboardTeacher,
  CheckCircle,
  XCircle,
  Clock,
  Sliders,
  Gear,
  ListDashes,
  Package,
  CurrencyDollar,
} from "@phosphor-icons/react";
import StarField from "../../components/ui/StarField";
import Loader from "../../components/ui/Loader";
import UnauthorizedPage from "../../components/ui/UnauthorizedPage";
import TeacherApplicationsModal from "../../components/ui/TeacherApplicationsModal";
import { tokenUtils, adminAPI } from "../../lib/api";
import Link from "next/link";

interface DashboardStats {
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  users: {
    teachers: number;
    students: number;
  };
  dynamicOptions: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

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

export default function AdminDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{
    id: string;
    email: string;
    role: string;
    fullName: string;
  } | null>(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const checkUserAuthorization = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Checking user authorization...");
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
          await fetchDashboardStats();
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
        errorMessage.includes("Access token required") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401")
      ) {
        console.log("Authentication error, redirecting to login");
        tokenUtils.removeToken();
        window.location.href = "/login";
      } else {
        console.log("Other error, setting unauthorized");
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
      window.location.href = "/login";
      return;
    }
    checkUserAuthorization();
  }, [checkUserAuthorization]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await adminAPI.getDashboardStats()) as ApiResponse;

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError("Failed to load dashboard statistics");
      }
    } catch (err: unknown) {
      console.error("Error fetching dashboard stats:", err);

      // التحقق من أخطاء المصادقة
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (
        errorMessage.includes("Access token required") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401")
      ) {
        // إزالة token غير الصالح وإعادة التوجيه لتسجيل الدخول
        tokenUtils.removeToken();
        window.location.href = "/login";
        return;
      }

      setError(errorMessage || "Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    tokenUtils.removeToken();
    window.location.href = "/login";
  };

  const handlePendingApplicationsClick = () => {
    setShowApplicationsModal(true);
  };

  if (loading) {
    return <Loader message='Checking permissions...' />;
  }

  // إذا لم يكن المستخدم مخول للوصول
  if (isAuthorized === false) {
    return (
      <UnauthorizedPage
        title='Admin Access Required'
        message={`Sorry ${
          userInfo?.fullName || "User"
        }, you don't have administrator privileges to access this dashboard. This area is restricted to system administrators only.`}
        showHomeButton={true}
        showBackButton={true}
      />
    );
  }

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
      <header className='absolute top-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16 justify-between'>
            <div className='flex items-center space-x-4'>
              <Image
                src='/logoFikrTech.png'
                alt='FikrTech Logo'
                width={70}
                height={70}
              />
              <h1 className='text-xl font-bold text-white'>Admin Dashboard</h1>
            </div>

            <button
              onClick={handleLogout}
              className='flex items-center space-x-2 px-3 py-2 text-white hover:text-red-400 transition-colors'>
              <SignOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-20'>
        <div className='max-w-7xl mx-auto'>
          {/* Welcome Section */}
          <div className='my-12 flex flex-col items-center justify-center'>
            <h2 className='text-3xl font-bold text-white mb-2'>
              Welcome to Admin Panel
            </h2>
            <p className='text-[#97beda] text-lg'>
              Manage your FikrTech platform from here
            </p>
            {error && (
              <div className='mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg'>
                <p className='text-red-400 mb-2'>{error}</p>
                <p className='text-gray-400 text-sm mb-3'>
                  Please make sure you&apos;re logged in with admin privileges
                  and try again.
                </p>
                <div className='flex space-x-2'>
                  <button
                    onClick={fetchDashboardStats}
                    className='px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors'>
                    Retry
                  </button>
                  <button
                    onClick={() => (window.location.href = "/login")}
                    className='px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 text-sm transition-colors'>
                    Login Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {!loading && !error && !stats && (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg mb-4'>
                No dashboard data available
              </p>
              <button
                onClick={fetchDashboardStats}
                className='px-6 py-3 bg-[#97beda]/20 hover:bg-[#97beda]/30 border border-[#97beda]/30 rounded-lg text-[#97beda] transition-colors'>
                Load Dashboard Data
              </button>
            </div>
          )}

          {stats && (
            <>
              {/* User Statistics */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-white mb-4'>
                  User Statistics
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-gray-300 text-sm'>Teachers</p>
                        <p className='text-white text-3xl font-bold'>
                          {stats.users.teachers.toLocaleString()}
                        </p>
                      </div>
                      <ChalkboardTeacher className='text-[#97beda]' size={40} />
                    </div>
                  </div>

                  <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-gray-300 text-sm'>Students</p>
                        <p className='text-white text-3xl font-bold'>
                          {stats.users.students.toLocaleString()}
                        </p>
                      </div>
                      <Student className='text-[#97beda]' size={40} />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Configuration */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-white mb-4'>
                  System Configuration
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-1 gap-6'>
                  <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-gray-300 text-sm'>Dynamic Options</p>
                        <p className='text-white text-2xl font-bold'>
                          {stats.dynamicOptions.toLocaleString()}
                        </p>
                      </div>
                      <Link href='/admin/parent-roles'>
                        <Sliders className='text-[#97beda]' size={32} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Statistics */}
              <div className='mb-8'>
                <div className='flex-col items-center justify-center space-x-2 mb-4'>
                  <h3 className='text-xl font-semibold text-white mb-4 inline'>
                    Application Statistics
                  </h3>
                  <a
                    onClick={handlePendingApplicationsClick}
                    className='text-[#97beda] inline cursor-pointer'>
                    <Gear
                      size={25}
                      className='inline mb-1 text-[#97beda] hover:text-[#97beda]/80 transition-colors'></Gear>
                  </a>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300 group'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-gray-300 text-sm'>
                          All Applications
                        </p>
                        <p className='text-white text-2xl font-bold'>
                          {stats.applications.total.toLocaleString()}
                        </p>
                      </div>
                      <ListDashes className='text-[#97beda] ' size={32} />
                    </div>
                  </div>

                  <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300 group'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-gray-300 text-sm'>Pending</p>
                        <p className='text-white text-2xl font-bold'>
                          {stats.applications.pending.toLocaleString()}
                        </p>
                      </div>
                      <Clock className='text-yellow-400' size={32} />
                    </div>
                  </div>

                  <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300 group'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-gray-300 text-sm'>Approved</p>
                        <p className='text-white text-2xl font-bold'>
                          {stats.applications.approved.toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className='text-green-400' size={32} />
                    </div>
                  </div>

                  <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300 group'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-gray-300 text-sm'>Rejected</p>
                        <p className='text-white text-2xl font-bold'>
                          {stats.applications.rejected.toLocaleString()}
                        </p>
                      </div>
                      <XCircle className='text-red-400' size={32} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Rate Chart */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-white mb-4'>
                  Application Status Overview
                </h3>
                <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-green-400 mb-2'>
                        {(
                          (stats.applications.approved /
                            stats.applications.total) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                      <p className='text-gray-300 text-sm'>Approval Rate</p>
                    </div>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-yellow-400 mb-2'>
                        {(
                          (stats.applications.pending /
                            stats.applications.total) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                      <p className='text-gray-300 text-sm'>Pending Rate</p>
                    </div>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-red-400 mb-2'>
                        {(
                          (stats.applications.rejected /
                            stats.applications.total) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                      <p className='text-gray-300 text-sm'>Rejection Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Management */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-white mb-4'>
                  Management
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div className='flex flex-row justify-between bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer'>
                    <div className='flex flex-col justify-center'>
                      <h4 className='text-white text-lg font-semibold mb-2'>
                        Packages
                      </h4>
                      <p className='text-gray-300 text-sm'>
                        View and manage all packages
                      </p>
                    </div>
                    <Link
                      href='/admin/pricing'
                      className='flex items-center justify-center'>
                      <CurrencyDollar className='text-[#97beda]' size={32} />
                    </Link>
                  </div>

                  <div className='flex flex-row justify-between bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer'>
                    <div className='flex flex-col justify-center'>
                      <h4 className='text-white text-lg font-semibold mb-2'>
                        Courses
                      </h4>
                      <p className='text-gray-300 text-sm'>
                        Review and approve courses
                      </p>
                    </div>
                    <Link
                      href='/admin/courses'
                      className='flex items-center justify-center'>
                      <Package className='text-green-400' size={32} />
                    </Link>
                  </div>

                  <div
                    onClick={handlePendingApplicationsClick}
                    className='flex flex-row justify-between bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer'>
                    <div className='flex flex-col justify-center'>
                      <h4 className='text-white text-lg font-semibold mb-2'>
                        Teachers
                      </h4>
                      <p className='text-gray-300 text-sm'>
                        Review teacher applications
                      </p>
                    </div>
                    <div className='flex items-center justify-center'>
                      <ChalkboardTeacher className='text-[#97beda]' size={32} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quick Actions 
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <Link
              href='/admin/users'
              className='group bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300'>
              <div className='flex items-center space-x-4'>
                <Users
                  className='text-[#97beda] group-hover:scale-110 transition-transform'
                  size={40}
                />
                <div>
                  <h3 className='text-white text-lg font-semibold mb-1'>
                    Manage Users
                  </h3>
                  <p className='text-gray-300 text-sm'>
                    View and manage all users
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href='/admin/orders'
              className='group bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300'>
              <div className='flex items-center space-x-4'>
                <ShoppingCart
                  className='text-[#97beda] group-hover:scale-110 transition-transform'
                  size={40}
                />
                <div>
                  <h3 className='text-white text-lg font-semibold mb-1'>
                    Orders
                  </h3>
                  <p className='text-gray-300 text-sm'>
                    Monitor and manage orders
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href='/admin/analytics'
              className='group bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300'>
              <div className='flex items-center space-x-4'>
                <ChartBar
                  className='text-[#97beda] group-hover:scale-110 transition-transform'
                  size={40}
                />
                <div>
                  <h3 className='text-white text-lg font-semibold mb-1'>
                    Analytics
                  </h3>
                  <p className='text-gray-300 text-sm'>
                    View platform statistics
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href='/admin/settings'
              className='group bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all duration-300'>
              <div className='flex items-center space-x-4'>
                <Gear
                  className='text-[#97beda] group-hover:scale-110 transition-transform'
                  size={40}
                />
                <div>
                  <h3 className='text-white text-lg font-semibold mb-1'>
                    Settings
                  </h3>
                  <p className='text-gray-300 text-sm'>
                    Platform configuration
                  </p>
                </div>
              </div>
            </Link>

            <div className='group bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6'>
              <div className='flex items-center space-x-4'>
                <Bell className='text-[#97beda]' size={40} />
                <div>
                  <h3 className='text-white text-lg font-semibold mb-1'>
                    Notifications
                  </h3>
                  <p className='text-gray-300 text-sm'>
                    System alerts and updates
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-gradient-to-r from-[#97beda]/20 to-[#97beda]/10 backdrop-blur-sm border border-[#97beda]/30 rounded-lg p-6'>
              <div className='text-center'>
                <h3 className='text-white text-lg font-semibold mb-2'>
                  System Status
                </h3>
                <div className='flex items-center justify-center space-x-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-green-400 font-medium'>
                    All Systems Operational
                  </span>
                </div>
              </div>
            </div>
          </div>*/}
        </div>
      </div>

      {/* Bottom gradient transition */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20' />

      {/* Teacher Applications Modal */}
      <TeacherApplicationsModal
        isOpen={showApplicationsModal}
        onClose={() => setShowApplicationsModal(false)}
      />
    </div>
  );
}
