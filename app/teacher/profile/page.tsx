"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tokenUtils } from "../../../lib/api";
import Loader from "../../../components/ui/Loader";

const API_BASE_URL = "http://localhost:5000";

interface Course {
  id: string;
  title: string;
  description?: string;
  subject: string;
  price: number;
  status: string;
  createdAt: string;
}

interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  shortBio?: string;
  isApproved: boolean;
  courses: Course[];
  teacherApplication?: {
    status: string;
  };
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teacher/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
      REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm border ${
          styles[status as keyof typeof styles] || styles.PENDING
        }`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <Loader message='Loading your profile...' />;
  }

  if (error || !profile) {
    return (
      <div className='min-h-screen bg-gradient-to-r from-[#041932] to-[#041322] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-400 text-xl mb-4'>
            {error || "Profile not found"}
          </p>
          <Link
            href='/teacher-registration'
            className='text-[#97beda] hover:underline'>
            Complete your registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gradient-to-r from-[#041932] to-[#041322] py-20'
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Profile Header */}
        <div className='bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-6'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center space-x-4'>
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.fullName}
                  className='w-20 h-20 rounded-full object-cover'
                />
              ) : (
                <div className='w-20 h-20 rounded-full bg-[#97beda] flex items-center justify-center text-white text-2xl font-bold'>
                  {profile.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  {profile.fullName}
                </h1>
                <p className='text-[#97beda]'>{profile.phone}</p>
                {profile.shortBio && (
                  <p className='text-white/70 mt-2 max-w-2xl'>
                    {profile.shortBio}
                  </p>
                )}
              </div>
            </div>

            <div className='text-right'>
              <div className='mb-2'>
                {getStatusBadge(
                  profile.teacherApplication?.status || "PENDING"
                )}
              </div>
              {profile.isApproved && (
                <span className='text-green-400 text-sm'>
                  ✓ Approved Teacher
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Application Status Message */}
        {!profile.isApproved && (
          <div className='bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6'>
            <p className='text-yellow-400'>
              Your profile is pending approval. You can add courses once your
              profile is approved by our admin team.
            </p>
          </div>
        )}

        {/* My Courses Section */}
        <div className='bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-white'>My Courses</h2>
            {profile.isApproved && (
              <Link
                href='/teacher/courses'
                className='px-4 py-2 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] transition-all'>
                Manage Courses
              </Link>
            )}
          </div>

          {profile.courses && profile.courses.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {profile.courses.map((course) => (
                <div
                  key={course.id}
                  className='bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all'>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='text-lg font-semibold text-white'>
                      {course.title}
                    </h3>
                    {getStatusBadge(course.status)}
                  </div>
                  <p className='text-white/70 text-sm mb-2'>{course.subject}</p>
                  {course.description && (
                    <p className='text-white/60 text-sm mb-3 line-clamp-2'>
                      {course.description}
                    </p>
                  )}
                  <div className='flex items-center justify-between'>
                    <span className='text-[#97beda] font-semibold'>
                      {course.price} AED
                    </span>
                    <Link
                      href={`/teacher/courses?edit=${course.id}`}
                      className='text-white/70 hover:text-white text-sm'>
                      Edit →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-white/70 mb-4'>
                You haven't created any courses yet
              </p>
              {profile.isApproved && (
                <Link
                  href='/teacher/courses'
                  className='inline-block px-6 py-3 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] transition-all'>
                  Create Your First Course
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
          <div className='bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20'>
            <h3 className='text-white/70 text-sm mb-2'>Total Courses</h3>
            <p className='text-3xl font-bold text-white'>
              {profile.courses?.length || 0}
            </p>
          </div>
          <div className='bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20'>
            <h3 className='text-white/70 text-sm mb-2'>Approved Courses</h3>
            <p className='text-3xl font-bold text-green-400'>
              {profile.courses?.filter((c) => c.status === "APPROVED").length ||
                0}
            </p>
          </div>
          <div className='bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20'>
            <h3 className='text-white/70 text-sm mb-2'>Pending Review</h3>
            <p className='text-3xl font-bold text-yellow-400'>
              {profile.courses?.filter((c) => c.status === "PENDING").length ||
                0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
