"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { tokenUtils } from "../../../lib/api";
import Loader from "../../../components/ui/Loader";

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
  status: string;
  createdAt: string;
}

interface CourseFormData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  curriculum: string;
  price: number;
  duration: number;
  maxStudents: number;
}

function TeacherCoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    subject: "",
    grade: "",
    curriculum: "",
    price: 0,
    duration: 1,
    maxStudents: 10,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCourses();
    const editId = searchParams.get("edit");
    if (editId) {
      setShowForm(true);
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/course/teacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []);
        
        // Check if editing
        const editId = searchParams.get("edit");
        if (editId) {
          const courseToEdit = data.data.find((c: Course) => c.id === editId);
          if (courseToEdit) {
            setEditingCourse(courseToEdit);
            setFormData({
              title: courseToEdit.title,
              description: courseToEdit.description || "",
              subject: courseToEdit.subject,
              grade: courseToEdit.grade || "",
              curriculum: courseToEdit.curriculum || "",
              price: courseToEdit.price,
              duration: courseToEdit.duration || 1,
              maxStudents: courseToEdit.maxStudents || 10,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = tokenUtils.getToken();
      const url = editingCourse
        ? `${API_BASE_URL}/api/course/${editingCourse.id}`
        : `${API_BASE_URL}/api/course/create`;
      
      const method = editingCourse ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(
          editingCourse
            ? "Course updated successfully!"
            : "Course created successfully!"
        );
        setShowForm(false);
        setEditingCourse(null);
        resetForm();
        fetchCourses();
      } else {
        setError(data.message || "Failed to save course");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      setError("Failed to save course. Please try again.");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const token = tokenUtils.getToken();
      const response = await fetch(`${API_BASE_URL}/api/course/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Course deleted successfully!");
        fetchCourses();
      } else {
        setError(data.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: "",
      grade: "",
      curriculum: "",
      price: 0,
      duration: 1,
      maxStudents: 10,
    });
    setEditingCourse(null);
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

  if (loading) {
    return <Loader message="Loading courses..." />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-[#041932] to-[#041322] py-20"
      style={{ fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
            <Link
              href="/teacher/profile"
              className="text-[#97beda] hover:underline"
            >
              ← Back to Profile
            </Link>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                resetForm();
              }
            }}
            className="px-6 py-3 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] transition-all"
          >
            {showForm ? "Cancel" : "+ Add New Course"}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Course Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCourse ? "Edit Course" : "Create New Course"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    <option value="">Select Grade</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={`GRADE${i + 1}`}>
                        Grade {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Curriculum</label>
                  <select
                    value={formData.curriculum}
                    onChange={(e) =>
                      setFormData({ ...formData, curriculum: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    <option value="">Select Curriculum</option>
                    <option value="IB_SYSTEM">IB System</option>
                    <option value="AMERICAN_SYSTEM">American System</option>
                    <option value="BRITISH_SYSTEM">British System</option>
                    <option value="FRENCH_SYSTEM">French System</option>
                    <option value="NATIONAL_SYSTEM">National System</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Price (AED) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Max Students</label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxStudents: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] transition-all"
                >
                  {editingCourse ? "Update Course" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">All Courses</h2>

          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {course.title}
                        </h3>
                        {getStatusBadge(course.status)}
                      </div>
                      <p className="text-white/70 mb-2">{course.subject}</p>
                      {course.description && (
                        <p className="text-white/60 mb-3">{course.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        {course.grade && <span>Grade: {course.grade}</span>}
                        {course.curriculum && (
                          <span>Curriculum: {course.curriculum}</span>
                        )}
                        {course.duration && (
                          <span>Duration: {course.duration}h</span>
                        )}
                        <span className="text-[#97beda] font-semibold">
                          {course.price} AED
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setFormData({
                            title: course.title,
                            description: course.description || "",
                            subject: course.subject,
                            grade: course.grade || "",
                            curriculum: course.curriculum || "",
                            price: course.price,
                            duration: course.duration || 1,
                            maxStudents: course.maxStudents || 10,
                          });
                          setShowForm(true);
                        }}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">No courses yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-[#97beda] text-white rounded-lg hover:bg-[#7a9ec4] transition-all"
              >
                Create Your First Course
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherCoursesPage() {
  return (
    <Suspense fallback={<Loader message="Loading courses..." />}>
      <TeacherCoursesContent />
    </Suspense>
  );
}

