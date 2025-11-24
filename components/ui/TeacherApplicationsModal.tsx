"use client";

import { useEffect, useState } from "react";
import {
  X,
  MagnifyingGlass,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  GraduationCap,
  BookOpen,
  Eye,
} from "@phosphor-icons/react";
import { adminAPI } from "../../lib/api";

interface TeacherApplication {
  id: string;
  teacherId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  applicationData: {
    fullName: string;
    gender: string;
    nationality: string;
    dateOfBirth: string;
    phone: string;
    universityAffiliation: string;
    highestEducation: string;
    yearsExperience: number;
    shortBio: string;
    proposedHourlyRate: number;
    selectedRoles: string[];
    selectedOptions: string[];
  };
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: string;
    user: {
      email: string;
    };
  } | null;
}

interface ApplicationsResponse {
  success: boolean;
  message: string;
  data: TeacherApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TeacherApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApplicationDetailsModalProps {
  application: TeacherApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

// Application Details Modal Component
function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApplicationDetailsModalProps & {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !application) return null;

  const handleApprove = () => {
    if (confirm("Are you sure you want to approve this application?")) {
      onApprove(application.id);
      onClose();
    }
  };

  const handleReject = () => {
    if (showRejectForm) {
      onReject(application.id);
      onClose();
      setShowRejectForm(false);
      setRejectionNotes("");
    } else {
      setShowRejectForm(true);
    }
  };

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative bg-[#041932] border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/10'>
          <div>
            <h3 className='text-xl font-bold text-white'>
              Application Details
            </h3>
            <p className='text-gray-400 mt-1'>
              {application.applicationData.fullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[70vh]'>
          <div className='space-y-6'>
            {/* Status and Date */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                    application.status === "PENDING"
                      ? "text-yellow-400 bg-yellow-400/20"
                      : application.status === "APPROVED"
                      ? "text-green-400 bg-green-400/20"
                      : "text-red-400 bg-red-400/20"
                  }`}>
                  {application.status === "PENDING" ? (
                    <Clock className='text-yellow-400' size={16} />
                  ) : application.status === "APPROVED" ? (
                    <CheckCircle className='text-green-400' size={16} />
                  ) : (
                    <XCircle className='text-red-400' size={16} />
                  )}
                  <span>{application.status}</span>
                </div>
              </div>
              <div className='text-gray-400 text-sm'>
                Submitted:{" "}
                {new Date(application.submittedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className='text-white font-medium mb-3 flex items-center space-x-2'>
                <User className='text-[#97beda]' size={20} />
                <span>Personal Information</span>
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>Full Name</p>
                  <p className='text-white font-medium'>
                    {application.applicationData.fullName}
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>Gender</p>
                  <p className='text-white font-medium'>
                    {application.applicationData.gender}
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>Nationality</p>
                  <p className='text-white font-medium'>
                    {application.applicationData.nationality}
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>Phone</p>
                  <p className='text-white font-medium'>
                    {application.applicationData.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Education & Experience */}
            <div>
              <h4 className='text-white font-medium mb-3 flex items-center space-x-2'>
                <GraduationCap className='text-[#97beda]' size={20} />
                <span>Education & Experience</span>
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>University</p>
                  <p className='text-white font-medium'>
                    {application.applicationData.universityAffiliation}
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>Highest Education</p>
                  <p className='text-white font-medium'>
                    {application.applicationData.highestEducation}
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>Years of Experience</p>
                  <p className='text-white font-medium'>
                    {application.applicationData.yearsExperience} years
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                  <p className='text-gray-400 text-sm'>Proposed Hourly Rate</p>
                  <p className='text-white font-medium'>
                    ${application.applicationData.proposedHourlyRate}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className='text-white font-medium mb-3 flex items-center space-x-2'>
                <BookOpen className='text-[#97beda]' size={20} />
                <span>Bio</span>
              </h4>
              <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
                <p className='text-gray-300'>
                  {application.applicationData.shortBio}
                </p>
              </div>
            </div>

            {/* Selected Roles */}
            <div>
              <h4 className='text-white font-medium mb-3 flex items-center space-x-2'>
                <GraduationCap className='text-[#97beda]' size={20} />
                <span>Selected Roles</span>
              </h4>
              <div className='flex flex-wrap gap-2'>
                {application.applicationData.selectedRoles.map(
                  (role, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-[#97beda]/20 text-[#97beda] text-sm rounded-full'>
                      {role}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Selected Options */}
            <div>
              <h4 className='text-white font-medium mb-3 flex items-center space-x-2'>
                <BookOpen className='text-[#97beda]' size={20} />
                <span>Selected Options</span>
              </h4>
              <div className='flex flex-wrap gap-2'>
                {application.applicationData.selectedOptions &&
                  application.applicationData.selectedOptions.map(
                    (option, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full'>
                        {option}
                      </span>
                    )
                  )}
                {application.applicationData.selectedSubOptions &&
                  application.applicationData.selectedSubOptions.map(
                    (optionId, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full'>
                        Option {index + 1}
                      </span>
                    )
                  )}
                {!application.applicationData.selectedOptions &&
                  !application.applicationData.selectedSubOptions && (
                    <span className='text-gray-400 text-sm'>
                      No options selected
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {application.status === "PENDING" && (
            <div className='p-6 border-t border-white/10'>
              {showRejectForm ? (
                <div className='space-y-4'>
                  <div>
                    <label className='block text-white mb-2'>
                      Rejection Notes (Optional)
                    </label>
                    <textarea
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      className='w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white'
                      rows={3}
                      placeholder='Provide feedback to the teacher...'
                    />
                  </div>
                  <div className='flex space-x-3'>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className='flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all'>
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className='flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all'>
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className='flex space-x-3'>
                  <button
                    onClick={handleApprove}
                    className='flex-1 px-6 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 border border-green-500/30 transition-all font-semibold'>
                    ✓ Approve Application
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className='flex-1 px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all font-semibold'>
                    ✗ Reject Application
                  </button>
                </div>
              )}
            </div>
          )}

          {application.status !== "PENDING" && (
            <div className='p-6 border-t border-white/10'>
              <div
                className={`p-4 rounded-lg ${
                  application.status === "APPROVED"
                    ? "bg-green-500/20 border border-green-500/30"
                    : "bg-red-500/20 border border-red-500/30"
                }`}>
                <p
                  className={`text-center font-semibold ${
                    application.status === "APPROVED"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}>
                  This application has been {application.status.toLowerCase()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherApplicationsModal({
  isOpen,
  onClose,
}: TeacherApplicationsModalProps) {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedApplication, setSelectedApplication] =
    useState<TeacherApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async (page: number = 1, status?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        page: number;
        limit: number;
        status?: string;
      } = {
        page,
        limit: 10,
      };

      if (status && status !== "ALL") {
        params.status = status;
      }

      const response = (await adminAPI.getTeacherApplications(
        params
      )) as ApplicationsResponse;

      if (response.success) {
        setApplications(response.data);
        setPagination(response.pagination);
      } else {
        setError("Failed to load applications");
      }
    } catch (err: unknown) {
      console.error("Error fetching applications:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchApplications(1, statusFilter);
    }
  }, [isOpen, statusFilter]);

  const handleApproveApplication = async (applicationId: string) => {
    try {
      setActionLoading(true);
      const response = await adminAPI.reviewTeacherApplication(applicationId, {
        status: "APPROVED",
      });

      if (response.success) {
        alert("Application approved successfully!");
        fetchApplications(currentPage, statusFilter);
      } else {
        alert("Failed to approve application");
      }
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Error approving application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId: string, notes?: string) => {
    try {
      setActionLoading(true);
      const response = await adminAPI.reviewTeacherApplication(applicationId, {
        status: "REJECTED",
        reviewNotes: notes || "",
      });

      if (response.success) {
        alert("Application rejected");
        fetchApplications(currentPage, statusFilter);
      } else {
        alert("Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Error rejecting application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchApplications(page, statusFilter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className='text-yellow-400' size={16} />;
      case "APPROVED":
        return <CheckCircle className='text-green-400' size={16} />;
      case "REJECTED":
        return <XCircle className='text-red-400' size={16} />;
      default:
        return <Clock className='text-gray-400' size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/20";
      case "APPROVED":
        return "text-green-400 bg-green-400/20";
      case "REJECTED":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const filteredApplications = applications.filter((app) =>
    app.applicationData.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-[#041932] border border-white/20 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/10'>
          <div>
            <h2 className='text-2xl font-bold text-white'>
              Teacher Applications
            </h2>
            <p className='text-gray-400 mt-1'>
              Manage and review teacher applications
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className='p-6 border-b border-white/10'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlass
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={18}
                />
                <input
                  type='text'
                  placeholder='Search by name...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#97beda]'
                />
              </div>
            </div>

            {/* Status Filter */}

            <div className='flex gap-2'>
              <button
                onClick={() => handleStatusFilter("ALL")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-[#97beda] text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}>
                All
              </button>
              <button
                onClick={() => handleStatusFilter("PENDING")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}>
                Pending
              </button>

              <button
                onClick={() => handleStatusFilter("APPROVED")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "APPROVED"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}>
                Approved
              </button>
              <button
                onClick={() => handleStatusFilter("REJECTED")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "REJECTED"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}>
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#97beda]'></div>
              <span className='ml-3 text-gray-400'>
                Loading applications...
              </span>
            </div>
          ) : error ? (
            <div className='text-center py-12'>
              <p className='text-red-400 mb-4'>{error}</p>
              <button
                onClick={() => fetchApplications(currentPage, statusFilter)}
                className='px-4 py-2 bg-[#97beda]/20 hover:bg-[#97beda]/30 border border-[#97beda]/30 rounded-lg text-[#97beda] transition-colors'>
                Retry
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg'>No applications found</p>
            </div>
          ) : (
            <>
              {/* Applications List */}
              <div className='space-y-4'>
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className='bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div className='p-2 bg-white/10 rounded-lg'>
                          <User className='text-[#97beda]' size={24} />
                        </div>
                        <div>
                          <h3 className='text-white font-medium'>
                            {application.applicationData.fullName}
                          </h3>
                          <div className='flex items-center space-x-4 mt-1'>
                            <div className='flex items-center space-x-2'>
                              <Calendar className='text-gray-400' size={14} />
                              <span className='text-gray-400 text-sm'>
                                {new Date(
                                  application.submittedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <GraduationCap
                                className='text-gray-400'
                                size={14}
                              />
                              <span className='text-gray-400 text-sm'>
                                {
                                  application.applicationData.selectedRoles
                                    .length
                                }{" "}
                                roles
                              </span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <User className='text-gray-400' size={14} />
                              <span className='text-gray-400 text-sm'>
                                {application.applicationData.yearsExperience}{" "}
                                years exp
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center space-x-4'>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            application.status
                          )}`}>
                          {getStatusIcon(application.status)}
                          <span>{application.status}</span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailsModal(true);
                          }}
                          className='p-2 text-gray-400 hover:text-white transition-colors'>
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Roles and Options */}
                    <div className='mt-4 pt-4 border-t border-white/10'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div>
                          <p className='text-gray-400 text-sm mb-2'>
                            Selected Roles
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            {application.applicationData.selectedRoles.map(
                              (role, index) => (
                                <span
                                  key={index}
                                  className='px-2 py-1 bg-[#97beda]/20 text-[#97beda] text-xs rounded'>
                                  {role}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <p className='text-gray-400 text-sm mb-2'>
                            Selected Options
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            {application.applicationData.selectedOptions &&
                              application.applicationData.selectedOptions
                                .slice(0, 3)
                                .map((option, index) => (
                                  <span
                                    key={index}
                                  className='px-2 py-1 bg-white/10 text-gray-300 text-xs rounded'>
                                  {option}
                                </span>
                              ))}
                            {application.applicationData.selectedOptions &&
                              application.applicationData.selectedOptions
                                .length > 3 && (
                                <span className='px-2 py-1 bg-white/10 text-gray-300 text-xs rounded'>
                                  +
                                  {application.applicationData.selectedOptions
                                    .length - 3}{" "}
                                  more
                                </span>
                              )}
                          </div>
                        </div>

                        <div>
                          <p className='text-gray-400 text-sm mb-2'>
                            Experience & Rate
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            <span className='px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded'>
                              {application.applicationData.yearsExperience}{" "}
                              years
                            </span>
                            <span className='px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded'>
                              ${application.applicationData.proposedHourlyRate}
                              /hr
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className='flex items-center justify-between mt-6 pt-6 border-t border-white/10'>
                  <div className='text-gray-400 text-sm'>
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} applications
                  </div>

                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors'>
                      Previous
                    </button>

                    <div className='flex items-center space-x-1'>
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg transition-colors ${
                                currentPage === page
                                  ? "bg-[#97beda] text-white"
                                  : "bg-white/10 text-gray-300 hover:bg-white/20"
                              }`}>
                              {page}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className='px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors'>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
      />
    </div>
  );
}
