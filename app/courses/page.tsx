"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL = "http://localhost:5000";

interface Course {
  id: string;
  title: string;
  description?: string;
  subject: string;
  grade?: string;
  curriculum?: string;
  price: number;
  duration?: number;
  maxStudents?: number;
  teacher: {
    fullName: string;
    profilePhoto?: string;
    shortBio?: string;
    yearsExperience?: number;
  };
}

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: "",
    grade: "",
    curriculum: "",
    search: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, courses]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/course/public`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []);
        setFilteredCourses(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (filters.subject) {
      filtered = filtered.filter((c) =>
        c.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    if (filters.grade) {
      filtered = filtered.filter((c) => c.grade === filters.grade);
    }

    if (filters.curriculum) {
      filtered = filtered.filter((c) => c.curriculum === filters.curriculum);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          c.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
          c.teacher.fullName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const resetFilters = () => {
    setFilters({
      subject: "",
      grade: "",
      curriculum: "",
      search: "",
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-[#041932] to-[#041322] py-20"
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Browse Courses
          </h1>
          <p className="text-[#97beda] text-xl">
            Discover quality courses from expert teachers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2 text-sm">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search courses..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">Subject</label>
              <input
                type="text"
                value={filters.subject}
                onChange={(e) =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                placeholder="e.g., Mathematics"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">Grade</label>
              <select
                value={filters.grade}
                onChange={(e) =>
                  setFilters({ ...filters, grade: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">All Grades</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={`GRADE${i + 1}`}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">Curriculum</label>
              <select
                value={filters.curriculum}
                onChange={(e) =>
                  setFilters({ ...filters, curriculum: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">All Curricula</option>
                <option value="IB_SYSTEM">IB System</option>
                <option value="AMERICAN_SYSTEM">American System</option>
                <option value="BRITISH_SYSTEM">British System</option>
                <option value="FRENCH_SYSTEM">French System</option>
                <option value="NATIONAL_SYSTEM">National System</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-white/70 text-sm">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-[#97beda] hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden hover:bg-white/15 transition-all group"
              >
                {/* Course Header */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#97beda] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[#97beda] text-sm mb-3">{course.subject}</p>

                  {course.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  {/* Course Details */}
                  <div className="space-y-2 mb-4">
                    {course.grade && (
                      <div className="flex items-center text-white/70 text-sm">
                        <span className="mr-2">📚</span>
                        <span>{course.grade.replace("GRADE", "Grade ")}</span>
                      </div>
                    )}
                    {course.curriculum && (
                      <div className="flex items-center text-white/70 text-sm">
                        <span className="mr-2">🎓</span>
                        <span>
                          {course.curriculum.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                    )}
                    {course.duration && (
                      <div className="flex items-center text-white/70 text-sm">
                        <span className="mr-2">⏱️</span>
                        <span>{course.duration} hours</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-[#97beda] mb-4">
                    {course.price} AED
                  </div>

                  {/* Teacher Info */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                    {course.teacher.profilePhoto ? (
                      <img
                        src={course.teacher.profilePhoto}
                        alt={course.teacher.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#97beda] flex items-center justify-center text-white font-bold">
                        {course.teacher.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {course.teacher.fullName}
                      </p>
                      {course.teacher.yearsExperience && (
                        <p className="text-white/60 text-xs">
                          {course.teacher.yearsExperience} years experience
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <button className="w-full px-4 py-3 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] transition-all font-semibold">
                    Contact Teacher
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
            <p className="text-white/70 text-xl mb-4">
              No courses found matching your criteria
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

