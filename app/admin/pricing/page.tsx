"use client";
import Loader from "@/components/ui/Loader";
import StarField from "@/components/ui/StarField";
import UnauthorizedPage from "@/components/ui/UnauthorizedPage";
import { adminAPI, tokenUtils } from "@/lib/api";
import {
  ArrowLeft,
  Bell,
  MagnifyingGlass,
  SignOut,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

interface PricingPlan {
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

export default function AdminPricingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userInfo, setUserInfo] = useState<any>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<PricingPlan>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/pricing`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch pricing plans");
      const data: PricingPlan[] = await response.json();
      setPricingPlans(data);
    } catch (err) {
      console.error("Error fetching pricing plans:", err);
      setError("Failed to load pricing plans");
    }
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan.id);
    setEditingData({
      title: plan.title,
      priceAED: plan.priceAED,
      paidHours: plan.paidHours,
      freeSessions: plan.freeSessions,
      totalHours: plan.totalHours,
      shortNote: plan.shortNote,
    });
  };

  const handleSave = async (planId: number) => {
    try {
      setSaving(true);
      setError(null); // Clear any previous errors

      console.log("Saving plan:", planId, editingData);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/pricing/${planId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(editingData),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(
          `Failed to update plan: ${response.status} - ${errorText}`
        );
      }

      const updatedPlan = await response.json();
      console.log("Updated plan:", updatedPlan);

      // Update local state
      setPricingPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId
            ? { ...plan, ...editingData, updatedAt: new Date().toISOString() }
            : plan
        )
      );

      setEditingPlan(null);
      setEditingData({});
    } catch (err) {
      console.error("Error saving plan:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save changes";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditingData({});
  };

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
          // إذا كان المستخدم admin، قم بجلب بيانات التسعير
          await fetchPricingPlans();
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

  const handleLogout = () => {
    tokenUtils.removeToken();
    window.location.href = "/login";
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
              <Link
                href='/admin'
                className='p-2 text-white hover:text-[#97beda] transition-colors'>
                <ArrowLeft size={24} />
              </Link>
              <img
                src='/logoFikrTech.png'
                alt='FikrTech Logo'
                width={70}
                height={70}
              />
              <h1 className='text-xl font-bold text-white'>/Pricing</h1>
            </div>

            <div className='flex items-center space-x-4'>
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
      <div className='relative z-10 pt-20 pb-8 flex flex-col items-center justify-center'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='my-20'>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-center'>
              Pricing Plans Management
            </h2>
            <p className='text-gray-400 text-lg ml-4 text-center'>
              Edit pricing plans below. Click edit to modify values.
            </p>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 rounded-xl shadow-lg'>
              <div className='flex items-center space-x-3'>
                <div className='w-6 h-6 bg-red-800 rounded-full flex items-center justify-center'>
                  <X size={14} className='text-white' />
                </div>
                <p className='text-red-800 font-medium'>{error}</p>
              </div>
            </div>
          )}

          {/* Pricing Table */}
          <div className='bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-2xl'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-gray-700/80 to-gray-600/80'>
                  <tr>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-16'>
                      #
                    </th>
                    <th className='px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 min-w-[120px]'>
                      Title
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-24'>
                      <div className='leading-tight'>
                        <div>Level</div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-24'>
                      <div className='leading-tight'>
                        <div>Mode</div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-28'>
                      <div className='leading-tight'>
                        <div>Price</div>
                        <div className='text-[10px] text-gray-300'>(AED)</div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-24'>
                      <div className='leading-tight'>
                        <div>Paid</div>
                        <div className='text-[10px] text-gray-300'>Hours</div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-24'>
                      <div className='leading-tight'>
                        <div>Free</div>
                        <div className='text-[10px] text-gray-300'>
                          Sessions
                        </div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-24'>
                      <div className='leading-tight'>
                        <div>Total</div>
                        <div className='text-[10px] text-gray-300'>Hours</div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 w-28'>
                      <div className='leading-tight'>
                        <div>Rate</div>
                        <div className='text-[10px] text-gray-300'>
                          (AED/hr)
                        </div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-gray-600/50 min-w-[100px]'>
                      <div className='leading-tight'>
                        <div>Short</div>
                        <div className='text-[10px] text-gray-300'>Note</div>
                      </div>
                    </th>
                    <th className='px-3 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider w-24'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-600/30'>
                  {pricingPlans.map((plan, index) => (
                    <tr
                      key={plan.id}
                      className={`hover:bg-gradient-to-r hover:from-gray-700/40 hover:to-gray-600/40 transition-all duration-300 ${
                        index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/20"
                      }`}>
                      <td className='px-3 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold text-center'>
                        {index + 1}
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        {editingPlan === plan.id ? (
                          <input
                            type='text'
                            value={editingData.title || ""}
                            onChange={(e) =>
                              setEditingData((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            className='w-full px-2 py-1 bg-gray-600/80 border border-blue-400/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
                          />
                        ) : (
                          <span className='text-sm text-white font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                            {plan.title}
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            plan.level === "SCHOOL"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                          }`}>
                          {plan.level}
                        </span>
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            plan.mode === "ONLINE"
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                              : "bg-gradient-to-r from-red-800 to-red-800 text-white"
                          }`}>
                          {plan.mode}
                        </span>
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        {editingPlan === plan.id ? (
                          <input
                            type='number'
                            value={editingData.priceAED || ""}
                            onChange={(e) =>
                              setEditingData((prev) => ({
                                ...prev,
                                priceAED: Number(e.target.value),
                              }))
                            }
                            className='w-full px-2 py-1 bg-gray-600/80 border border-green-400/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-all duration-200'
                          />
                        ) : (
                          <span className='text-xs font-bold text-green-400 bg-green-400/10 px-1 py-0.5 rounded'>
                            {plan.priceAED.toLocaleString()} AED
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        {editingPlan === plan.id ? (
                          <input
                            type='number'
                            value={editingData.paidHours || ""}
                            onChange={(e) =>
                              setEditingData((prev) => ({
                                ...prev,
                                paidHours: Number(e.target.value),
                              }))
                            }
                            className='w-full px-2 py-1 bg-gray-600/80 border border-blue-400/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
                          />
                        ) : (
                          <span className='text-sm text-gray-300'>
                            {plan.paidHours}
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        {editingPlan === plan.id ? (
                          <input
                            type='number'
                            value={editingData.freeSessions || ""}
                            onChange={(e) =>
                              setEditingData((prev) => ({
                                ...prev,
                                freeSessions: Number(e.target.value),
                              }))
                            }
                            className='w-full px-2 py-1 bg-gray-600/80 border border-blue-400/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
                          />
                        ) : (
                          <span className='text-sm text-gray-300'>
                            {plan.freeSessions}
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        {editingPlan === plan.id ? (
                          <input
                            type='number'
                            value={editingData.totalHours || ""}
                            onChange={(e) =>
                              setEditingData((prev) => ({
                                ...prev,
                                totalHours: Number(e.target.value),
                              }))
                            }
                            className='w-full px-2 py-1 bg-gray-600/80 border border-blue-400/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
                          />
                        ) : (
                          <span className='text-sm text-gray-300'>
                            {plan.totalHours}
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap'>
                        <span className='text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-1 py-0.5 rounded'>
                          {plan.effectiveRateAED.toFixed(2)} AED/hr
                        </span>
                      </td>
                      <td className='px-3 py-4'>
                        {editingPlan === plan.id ? (
                          <input
                            type='text'
                            value={editingData.shortNote || ""}
                            onChange={(e) =>
                              setEditingData((prev) => ({
                                ...prev,
                                shortNote: e.target.value,
                              }))
                            }
                            className='w-full px-2 py-1 bg-gray-600/80 border border-blue-400/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
                          />
                        ) : (
                          <span className='text-sm text-gray-300'>
                            {plan.shortNote}
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-4 whitespace-nowrap text-sm font-medium'>
                        {editingPlan === plan.id ? (
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleSave(plan.id)}
                              disabled={saving}
                              className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2 py-1 rounded text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 py-1 rounded text-xs font-semibold transition-all duration-200'>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(plan)}
                            className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1 rounded text-xs font-semibold transition-all duration-200'>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
