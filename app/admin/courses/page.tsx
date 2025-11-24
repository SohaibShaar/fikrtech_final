"use client";

import { useEffect, useState } from "react";
import { tokenUtils } from "../../../lib/api";

const API_BASE_URL = "http://localhost:5000";

interface Course {
  id: string;
  title: string;
  description?: string;
  subject: string;
  grade?: string;
  curriculum?: string;
  price: number;
  status: string;
  teacher: {
    fullName: string;
    phone: string;
    user: {
      email: string;
    };
  };
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleApprove = async (courseId: string) => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses/${courseId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchCourses();
        alert("Course approved successfully!");
      } else {
        alert(data.message || "Failed to approve course");
      }
    } catch (error) {
      console.error("Error approving course:", error);
      alert("Failed to approve course");
    }
  };

  const handleReject = async () => {
    if (!selectedCourse) return;

    try {
      const token = tokenUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses/${selectedCourse.id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejectionNotes }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchCourses();
        setShowModal(false);
        setSelectedCourse(null);
        setRejectionNotes("");
        alert("Course rejected successfully!");
      } else {
        alert(data.message || "Failed to reject course");
      }
    } catch (error) {
      console.error("Error rejecting course:", error);
      alert("Failed to reject course");
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
        }`}
      >
        {status}
      </span>
    );
  };

  const stats = {
    total: courses.length,
    pending: courses.filter((c) => c.status === "PENDING").length,
    approved: courses.filter((c) => c.status === "APPROVED").length,
    rejected: courses.filter((c) => c.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#041932] to-[#041322] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Course Management
          </h1>
          <p className="text-[#97beda]">
            Review and manage all courses on the platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-white/70 text-sm mb-2">Total Courses</h3>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-lg p-6 border border-yellow-500/30">
            <h3 className="text-yellow-400 text-sm mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-green-500/20 backdrop-blur-lg rounded-lg p-6 border border-green-500/30">
            <h3 className="text-green-400 text-sm mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
          </div>
          <div className="bg-red-500/20 backdrop-blur-lg rounded-lg p-6 border border-red-500/30">
            <h3 className="text-red-400 text-sm mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-sm">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, subject, or teacher..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>
            <div>
              <label className="block text-white mb-2 text-sm">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-white mt-4">Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {course.title}
                        </h3>
                        {getStatusBadge(course.status)}
                      </div>
                      <p className="text-[#97beda] mb-2">{course.subject}</p>
                      {course.description && (
                        <p className="text-white/70 mb-3">{course.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        {course.grade && <span>Grade: {course.grade}</span>}
                        {course.curriculum && (
                          <span>Curriculum: {course.curriculum}</span>
                        )}
                        <span className="text-[#97beda] font-semibold">
                          {course.price} AED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h4 className="text-white font-semibold mb-2">
                      Teacher Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-white/70">
                      <div>
                        <span className="text-white/50">Name:</span>{" "}
                        {course.teacher.fullName}
                      </div>
                      <div>
                        <span className="text-white/50">Email:</span>{" "}
                        {course.teacher.user.email}
                      </div>
                      <div>
                        <span className="text-white/50">Phone:</span>{" "}
                        {course.teacher.phone}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {course.status === "PENDING" && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(course.id)}
                        className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 border border-green-500/30 transition-all"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowModal(true);
                        }}
                        className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70">No courses found</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#041932] border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">
              Reject Course
            </h3>
            <p className="text-white/70 mb-4">
              Are you sure you want to reject "{selectedCourse.title}"?
            </p>
            <div className="mb-4">
              <label className="block text-white mb-2">
                Rejection Notes (Optional)
              </label>
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                rows={4}
                placeholder="Provide feedback to the teacher..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCourse(null);
                  setRejectionNotes("");
                }}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all"
              >
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

