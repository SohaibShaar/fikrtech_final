"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  ChalkboardTeacher,
  Users,
  Gear,
  ProjectorScreenChartIcon,
  Tag,
  Plus,
  PencilSimple,
  Trash,
  X,
  FloppyDisk,
  ListBulletsIcon,
  SignOut,
} from "@phosphor-icons/react";
import StarField from "../../../../components/ui/StarField";
import Loader from "../../../../components/ui/Loader";
import { tokenUtils, adminAPI, childrenAPI } from "../../../../lib/api";

interface Parent {
  id: string;
  parentRole: string;
  parentId: string | null;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children: Parent[];
  _count?: {
    children: number;
    teacherSelections: number;
    teacherDeepSelections: number;
  };
}

interface ParentsResponse {
  success: boolean;
  message: string;
  data: Parent[];
}

interface ParentsStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalParents: number;
    totalChildren: number;
    totalTeachers: number;
    byRole: {
      [key: string]: {
        count: number;
        children: number;
      };
    };
  };
}

const roleIcons = {
  TUTORING: GraduationCap,
  PROJECTS_MAKER: ProjectorScreenChartIcon,
  COURSING: BookOpen,
  COACHING: ChalkboardTeacher,
};

const roleColors = {
  TUTORING: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  PROJECTS_MAKER: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  COURSING: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  COACHING: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
};

const badgeColors = {
  TUTORING:
    "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
  PROJECTS_MAKER:
    "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30",
  COURSING:
    "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30",
  COACHING:
    "bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30",
};

export default function ParentRoleDetailsPage() {
  const params = useParams();
  const role = params.role as string;
  const [isLoaded, setIsLoaded] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [stats, setStats] = useState<ParentsStatsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentRole: "",
    parentId: null as string | null,
    isActive: true,
    sortOrder: 0,
  });

  // Children management state
  const [selectedCategory, setSelectedCategory] = useState<Parent | null>(null);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [children, setChildren] = useState<Parent[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [showCreateChildModal, setShowCreateChildModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Parent | null>(null);
  const [childFormData, setChildFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    sortOrder: 0,
  });

  // Filter state for showing inactive categories
  const [showInactive, setShowInactive] = useState(false);

  // Filter parents based on active status
  const filteredParents = showInactive
    ? parents
    : parents.filter((parent) => parent.isActive);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both parents and stats
      const [parentsResponse, statsResponse] = await Promise.all([
        adminAPI.getParentsByRole(
          role.toUpperCase(),
          true // Always fetch all parents (active and inactive)
        ) as Promise<ParentsResponse>,
        adminAPI.getParentsStats() as Promise<ParentsStatsResponse>,
      ]);

      if (parentsResponse.success) {
        setParents(parentsResponse.data);
      } else {
        setError("Failed to load parents");
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err: unknown) {
      console.error("Error fetching parents:", err);
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

      setError(errorMessage || "Error loading parents");
    } finally {
      setLoading(false);
    }
  }, [role]);

  // CRUD Functions
  const handleCreateParent = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError("Parent name is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Parent description is required");
      return;
    }

    try {
      const parentData = {
        ...formData,
        parentRole: role.toUpperCase(),
      };

      const response = (await adminAPI.createParent(parentData)) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        setShowCreateModal(false);
        setFormData({
          name: "",
          description: "",
          parentRole: "",
          parentId: null,
          isActive: true,
          sortOrder: 0,
        });
        fetchParents(); // Refresh the list
      }
    } catch (err) {
      console.error("Error creating parent:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to create parent: ${errorMessage}`);
    }
  };

  const handleEditParent = async () => {
    if (!editingParent) return;

    // Validation
    if (!formData.name.trim()) {
      setError("Parent name is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Parent description is required");
      return;
    }

    try {
      const response = (await adminAPI.updateParent(
        editingParent.id,
        formData
      )) as { success: boolean; message?: string };

      if (response.success) {
        setShowEditModal(false);
        setEditingParent(null);
        setFormData({
          name: "",
          description: "",
          parentRole: "",
          parentId: null,
          isActive: true,
          sortOrder: 0,
        });
        fetchParents(); // Refresh the list
      }
    } catch (err) {
      console.error("Error updating parent:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to update parent: ${errorMessage}`);
    }
  };

  const handleToggleParentStatus = async (
    parentId: string,
    currentStatus: boolean
  ) => {
    const action = currentStatus ? "deactivate" : "reactivate";
    const actionPast = currentStatus ? "deactivated" : "reactivated";

    if (!confirm(`Are you sure you want to ${action} this parent?`)) {
      return;
    }

    try {
      const response = (await adminAPI.updateParent(parentId, {
        isActive: !currentStatus,
      })) as { success: boolean; message?: string };

      if (response.success) {
        fetchParents(); // Refresh the list
        alert(`✅ Category ${actionPast} successfully!`);
      }
    } catch (err) {
      console.error(`Error ${action.replace("ate", "ating")} parent:`, err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to ${action} parent: ${errorMessage}`);
    }
  };

  // Keep the old function for backward compatibility
  const handleDeactivateParent = async (parentId: string) => {
    return handleToggleParentStatus(parentId, true);
  };

  const handleDeleteParent = async (parentId: string, isHardDelete = false) => {
    // Validation
    if (!parentId || parentId.trim() === "") {
      setError("Invalid parent ID");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${
          isHardDelete ? "permanently" : "temporarily"
        } delete this parent?`
      )
    ) {
      return;
    }

    try {
      const response = isHardDelete
        ? ((await adminAPI.deleteParentHard(parentId)) as {
            success: boolean;
            message?: string;
          })
        : ((await adminAPI.deleteParent(parentId)) as {
            success: boolean;
            message?: string;
          });

      if (response.success) {
        fetchParents(); // Refresh the list
      }
    } catch (err) {
      console.error("Error deleting parent:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      // Handle specific business logic errors as warnings instead of errors
      if (
        errorMessage.includes("Cannot delete parent with teacher selections") ||
        errorMessage.includes("Deactivate instead")
      ) {
        const shouldDeactivate = confirm(
          `⚠️ Cannot delete this category because it has active teacher selections.\n\n` +
            `Would you like to deactivate it instead? This will hide the category without permanently deleting it.\n\n` +
            `Click "OK" to deactivate, or "Cancel" to do nothing.`
        );

        if (shouldDeactivate) {
          // Use the parentId that was passed to this function
          handleDeactivateParent(parentId);
        }
        return;
      }

      // For other errors, show as error message
      setError(`Failed to delete parent: ${errorMessage}`);
    }
  };

  const openCreateModal = () => {
    setError(null); // Clear any existing errors
    setFormData({
      name: "",
      description: "",
      parentRole: role.toUpperCase(),
      parentId: null,
      isActive: true,
      sortOrder: parents.length,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (parent: Parent) => {
    setError(null); // Clear any existing errors
    setEditingParent(parent);
    setFormData({
      name: parent.name,
      description: parent.description,
      parentRole: parent.parentRole,
      parentId: parent.parentId,
      isActive: parent.isActive,
      sortOrder: parent.sortOrder,
    });
    setShowEditModal(true);
  };

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
    if (role) {
      fetchParents();
    }
  }, [role, fetchParents]);

  // Children management functions
  const handleViewChildren = async (category: Parent) => {
    setSelectedCategory(category);
    setShowChildrenModal(true);
    await fetchChildren(category.id);
  };

  const fetchChildren = async (categoryId: string) => {
    try {
      setChildrenLoading(true);
      const response = (await childrenAPI.getCategoryChildren(categoryId)) as {
        success: boolean;
        message?: string;
        data?: Parent[];
        pagination?: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      };

      if (response.success) {
        setChildren(response.data || []);
        console.log("Children updated:", response.data?.length || 0, "items"); // Debug log
      } else {
        console.error("Failed to fetch children:", response.message);
        setChildren([]);
      }
    } catch (err) {
      console.error("Error fetching children:", err);
      setChildren([]);
    } finally {
      setChildrenLoading(false);
    }
  };

  const handleCreateChild = () => {
    setChildFormData({
      name: "",
      description: "",
      isActive: true,
      sortOrder: 0,
    });
    setShowCreateChildModal(true);
  };

  const handleSubmitChild = async () => {
    if (!childFormData.name.trim() || !selectedCategory) {
      alert("Child name is required");
      return;
    }

    try {
      const response = (await childrenAPI.createCategoryChild(
        selectedCategory.id,
        {
          name: childFormData.name,
          description: childFormData.description,
          isActive: childFormData.isActive,
          sortOrder: childFormData.sortOrder,
        }
      )) as {
        success: boolean;
        message?: string;
        data?: Parent;
      };

      if (response.success && response.data) {
        console.log("Child created successfully:", response.data); // Debug log
        setShowCreateChildModal(false);

        // Add new child to both the children list and parent list
        const newChild = response.data;
        setChildren((prev) => [...prev, newChild]);

        // Update parent with new child in the main list
        setParents((prev) =>
          prev.map((parent) =>
            parent.id === selectedCategory.id
              ? {
                  ...parent,
                  children: [...(parent.children || []), newChild],
                  _count: {
                    children: (parent._count?.children || 0) + 1,
                    teacherSelections: parent._count?.teacherSelections || 0,
                    teacherDeepSelections:
                      parent._count?.teacherDeepSelections || 0,
                  },
                }
              : parent
          )
        );

        setChildFormData({
          name: "",
          description: "",
          isActive: true,
          sortOrder: 0,
        });
        // Show success message
        alert("✅ Child created successfully!");
      } else {
        alert(response.message || "Failed to create child");
      }
    } catch (err) {
      console.error("Error creating child:", err);
      alert("Error creating child");
    }
  };

  const handleEditChild = (child: Parent) => {
    setEditingChild(child);
    setChildFormData({
      name: child.name,
      description: child.description || "",
      isActive: child.isActive,
      sortOrder: child.sortOrder,
    });
    setShowEditChildModal(true);
  };

  const handleUpdateChild = async () => {
    if (!childFormData.name.trim() || !editingChild) {
      alert("Child name is required");
      return;
    }

    try {
      const response = (await childrenAPI.updateChild(editingChild.id, {
        name: childFormData.name,
        description: childFormData.description,
        isActive: childFormData.isActive,
        sortOrder: childFormData.sortOrder,
      })) as {
        success: boolean;
        message?: string;
        data?: Parent;
      };

      if (response.success && response.data) {
        setShowEditChildModal(false);
        setEditingChild(null);
        if (selectedCategory) {
          const updatedChild = response.data;

          // Update child in both lists
          setChildren((prev) =>
            prev.map((child) =>
              child.id === editingChild.id ? updatedChild : child
            )
          );

          // Update child in parent's children list
          setParents((prev) =>
            prev.map((parent) =>
              parent.id === selectedCategory.id
                ? {
                    ...parent,
                    children: (parent.children || []).map((child) =>
                      child.id === editingChild.id ? updatedChild : child
                    ),
                  }
                : parent
            )
          );
        }
        alert("✅ Child updated successfully!");
      } else {
        alert(response.message || "Failed to update child");
      }
    } catch (err) {
      console.error("Error updating child:", err);
      alert("Error updating child");
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!window.confirm("Are you sure you want to delete this child option?")) {
      return;
    }

    try {
      const response = (await childrenAPI.deleteChild(childId)) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        if (selectedCategory) {
          // Remove child from both lists
          setChildren((prev) => prev.filter((child) => child.id !== childId));

          // Remove child from parent's children list and update count
          setParents((prev) =>
            prev.map((parent) =>
              parent.id === selectedCategory.id
                ? {
                    ...parent,
                    children: (parent.children || []).filter(
                      (child) => child.id !== childId
                    ),
                    _count: {
                      children: Math.max(0, (parent._count?.children || 1) - 1),
                      teacherSelections: parent._count?.teacherSelections || 0,
                      teacherDeepSelections:
                        parent._count?.teacherDeepSelections || 0,
                    },
                  }
                : parent
            )
          );
        }
        alert("✅ Child deleted successfully!");
      } else {
        alert(response.message || "Failed to delete child");
      }
    } catch (err) {
      console.error("Error deleting child:", err);
      alert("Error deleting child");
    }
  };

  if (loading) {
    return <Loader message={`Loading ${role} parents...`} />;
  }

  const IconComponent =
    roleIcons[role.toUpperCase() as keyof typeof roleIcons] || Users;
  const colorClass =
    roleColors[role.toUpperCase() as keyof typeof roleColors] ||
    "from-gray-500/20 to-gray-600/20 border-gray-500/30";
  const badgeColorClass =
    badgeColors[role.toUpperCase() as keyof typeof badgeColors] ||
    "bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30";

  const handleLogout = () => {
    tokenUtils.removeToken();
    window.location.href = "/login";
  };

  return (
    <div
      className='relative min-h-screen h-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-r from-[#041932] to-[#041322]'
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
                href='/admin/parent-roles'
                className='p-2 text-white hover:text-[#97beda] transition-colors'>
                <ArrowLeft size={24} />
              </Link>
              <Image
                src='/logoFikrTech.png'
                alt='FikrTech Logo'
                width={70}
                height={70}
              />
              <h1 className='text-xl font-bold text-white'>
                /{role.replace("_", " ")}
              </h1>
            </div>

            <div className='flex items-center space-x-6'>
              <button
                onClick={openCreateModal}
                className='flex items-center space-x-2 px-2 py-1 bg-[#97beda]/20 hover:bg-[#97beda]/30 border border-[#97beda]/30 rounded-lg text-[#97beda] transition-colors'>
                <Plus size={16} />
                <span>Add Category</span>
              </button>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-2 px-3 py-2 text-white hover:text-red-400 transition-colors'>
                <SignOut size={18} />
                <span>Logout</span>
              </button>

              {/*
              <div className='text-white text-sm'>
                Categories:{" "}
                <span className='font-bold text-[#97beda]'>
                  {parents.length}
                </span>
              </div>
              <div className='text-white text-sm'>
                Subcategories:{" "}
                <span className='font-bold text-green-400'>
                  {parents.reduce(
                    (sum, parent) => sum + (parent._count?.children || 0),
                    0
                  )}
                </span>
              </div>
              <div className='text-white text-sm'>
                Teachers:{" "}
                <span className='font-bold text-yellow-400'>
                  {parents.reduce(
                    (sum, parent) =>
                      sum + (parent._count?.teacherSelections || 0),
                    0
                  )}
                </span>
              </div>*/}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-20 w-full'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Title */}
          <div className='my-12 text-center flex flex-col items-center space-y-4'>
            <div className='flex flex-row items-center'>
              <div
                className={` w-12 h-12 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center`}>
                <IconComponent className='text-white' size={25} />
              </div>
              <h2 className='ml-4 text-4xl font-bold text-white'>
                {role.replace("_", " ").toUpperCase()}
              </h2>
            </div>
            <p className='text-[#97beda] text-lg max-w-2xl mx-auto'>
              Browse all categories and subcategories for{" "}
              {role.replace("_", " ").toLowerCase()} services.
            </p>
          </div>

          {/* Controls Section 
          <div className='mb-6 flex justify-center'>
            <div className='flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3'>
              <span className='text-white text-sm'>
                Show Inactive Categories:
              </span>
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#97beda] focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  showInactive ? "bg-[#97beda]" : "bg-gray-600"
                }`}>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showInactive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className='text-gray-400 text-xs'>
                ({showInactive ? "All" : "Active Only"})
              </span>
            </div>
          </div>*/}

          {/* Statistics Section */}
          {stats && (
            <div className='mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-xl font-bold text-white mb-4 text-center'>
                Statistics
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-[#97beda] mb-1'>
                    {filteredParents.length}
                  </div>
                  <div className='text-gray-400 text-sm'>
                    {showInactive ? "Total" : "Active"} Categories
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-400 mb-1'>
                    {filteredParents.reduce(
                      (sum, parent) => sum + (parent._count?.children || 0),
                      0
                    )}
                  </div>
                  <div className='text-gray-400 text-sm'>Subcategories</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-400 mb-1'>
                    {filteredParents.reduce(
                      (sum, parent) =>
                        sum + (parent._count?.teacherSelections || 0),
                      0
                    )}
                  </div>
                  <div className='text-gray-400 text-sm'>Teachers</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className='mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg'>
              <p className='text-red-400 mb-2'>{error}</p>
              <button
                onClick={fetchParents}
                className='px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors'>
                Retry
              </button>
            </div>
          )}

          {parents.length === 0 && !error ? (
            <div className='text-center py-12'>
              <Gear className='mx-auto text-gray-400 mb-4' size={64} />
              <p className='text-gray-400 text-lg mb-4'>
                No parents found for {role.replace("_", " ").toLowerCase()}
              </p>
              <button
                onClick={fetchParents}
                className='px-6 py-3 bg-[#97beda]/20 hover:bg-[#97beda]/30 border border-[#97beda]/30 rounded-lg text-[#97beda] transition-colors'>
                Refresh
              </button>
            </div>
          ) : (
            <div className='space-y-8 mb-10'>
              {filteredParents.map((parent) => (
                <div
                  key={parent.id}
                  className={`bg-gradient-to-br ${colorClass} backdrop-blur-sm border rounded-xl p-6 ${
                    !parent.isActive ? "opacity-60 border-gray-500/50" : ""
                  }`}>
                  {/* Parent Header */}
                  <div className='flex items-start justify-between mb-6'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center'>
                        <IconComponent className='text-white' size={24} />
                      </div>
                      <div>
                        <h3 className='text-2xl font-bold text-white mb-1 flex items-center space-x-2'>
                          <span
                            className={
                              !parent.isActive
                                ? "line-through text-gray-400"
                                : ""
                            }>
                            {parent.name}
                          </span>
                          {!parent.isActive && (
                            <span className='px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse'>
                              Inactive
                            </span>
                          )}
                        </h3>
                        <p className='text-gray-300 text-sm'>
                          {parent.description}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      {/* Action Buttons */}
                      <div className='text-gray-400 text-xs'>
                        <span className='font-light text-base text-[#97beda]'>
                          Teachers:
                        </span>{" "}
                        <span className='font-bold text-base text-[#97beda]'>
                          {parent._count?.teacherSelections || 0}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => openEditModal(parent)}
                          className='p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors'
                          title='Edit Category'>
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => handleViewChildren(parent)}
                          className='p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors'
                          title='Manage Children'>
                          <ListBulletsIcon size={16} />
                        </button>
                        {/*<button
                          onClick={() =>
                            handleToggleParentStatus(parent.id, parent.isActive)
                          }
                          className={`p-2 border rounded-lg transition-colors ${
                            parent.isActive
                              ? "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-400"
                              : "bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400"
                          }`}
                          title={
                            parent.isActive
                              ? "Deactivate Category"
                              : "Reactivate Category"
                          }>
                          {parent.isActive ? (
                            <EyeSlash size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteParent(parent.id, false)}
                          className='p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors'
                          title='Soft Delete'>
                          <Trash size={16} />
                        </button>*/}
                        <button
                          onClick={() => handleDeleteParent(parent.id, true)}
                          className='p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-red-500 transition-colors'
                          title='Hard Delete'>
                          <Trash size={16} weight='fill' />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Children Badges */}
                  {parent.children && parent.children.length > 0 ? (
                    <div>
                      <div className='flex items-center space-x-2 mb-4'>
                        <Tag className='text-gray-400' size={16} />
                        <h4 className='text-lg font-semibold text-white'>
                          Subcategories ( {parent._count?.children || 0} )
                        </h4>
                      </div>
                      <div className='flex flex-wrap gap-3'>
                        {parent.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`#`}
                            className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:scale-105 ${badgeColorClass}`}>
                            <span>{child.name}</span>
                            {child._count && child._count.children > 0 && (
                              <span className='ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs'>
                                {child._count.children}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <div className='text-gray-400 text-sm'>
                        No subcategories available
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Parent Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-gradient-to-br from-[#041932] to-[#041322] border border-white/10 rounded-xl p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-white'>
                Create New Category
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className='p-2 text-gray-400 hover:text-white transition-colors'>
                <X size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-white text-sm mb-2'>Name</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none'
                  placeholder='Enter category name'
                />
              </div>

              <div>
                <label className='block text-white text-sm mb-2'>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none h-20 resize-none'
                  placeholder='Enter category description'
                />
              </div>

              {/*<div className='flex items-center space-x-4'>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className='rounded border-white/20 bg-white/10 text-[#97beda]'
                  />
                  <span className='text-white text-sm'>Active</span>
                </label>

                <div className='flex-1'>
                  <label className='block text-white text-sm mb-1'>
                    Sort Order
                  </label>
                  <input
                    type='number'
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white focus:border-[#97beda] focus:outline-none'
                  />
                </div>
              
              </div>*/}
            </div>

            <div className='flex items-center justify-end space-x-3 mt-6'>
              <button
                onClick={() => setShowCreateModal(false)}
                className='px-4 py-2 text-gray-400 hover:text-white transition-colors'>
                Cancel
              </button>
              <button
                onClick={handleCreateParent}
                className='flex items-center space-x-2 px-4 py-2 bg-[#97beda]/20 hover:bg-[#97beda]/30 border border-[#97beda]/30 rounded-lg text-[#97beda] transition-colors'>
                <FloppyDisk size={16} />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parent Modal */}
      {showEditModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-gradient-to-br from-[#041932] to-[#041322] border border-white/10 rounded-xl p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-white'>Edit Category</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className='p-2 text-gray-400 hover:text-white transition-colors'>
                <X size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-white text-sm mb-2'>Name</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none'
                  placeholder='Enter category name'
                />
              </div>

              <div>
                <label className='block text-white text-sm mb-2'>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none h-20 resize-none'
                  placeholder='Enter category description'
                />
              </div>

              {/*<div className='flex items-center space-x-4'>
                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className='rounded border-white/20 bg-white/10 text-[#97beda]'
                  />
                  <span className='text-white text-sm'>Active</span>
                </label>

                <div className='flex-1'>
                  <label className='block text-white text-sm mb-1'>
                    Sort Order
                  </label>
                  <input
                    type='number'
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white focus:border-[#97beda] focus:outline-none'
                  />
                </div>
              </div>*/}
            </div>

            <div className='flex items-center justify-end space-x-3 mt-6'>
              <button
                onClick={() => setShowEditModal(false)}
                className='px-4 py-2 text-gray-400 hover:text-white transition-colors'>
                Cancel
              </button>
              <button
                onClick={handleEditParent}
                className='flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors'>
                <FloppyDisk size={16} />
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Children Management Modal */}
      {showChildrenModal && selectedCategory && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-gradient-to-br from-[#041932] to-[#041322] border border-white/10 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-white'>
                Manage Children - {selectedCategory.name}
              </h3>
              <button
                onClick={() => {
                  setShowChildrenModal(false);
                  setSelectedCategory(null);
                  setChildren([]);
                }}
                className='p-2 text-gray-400 hover:text-white transition-colors'>
                <X size={20} />
              </button>
            </div>

            {/* Add Child Button */}
            <div className='mb-4'>
              <button
                onClick={handleCreateChild}
                className='flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors'>
                <Plus size={16} />
                <span>Add Child</span>
              </button>
            </div>

            {/* Children List */}
            {childrenLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
                <span className='ml-3 text-white'>Loading children...</span>
              </div>
            ) : children.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                No children found for this category
              </div>
            ) : (
              <div className='grid gap-4'>
                {children.map((child) => (
                  <div
                    key={child.id}
                    className='bg-white/5 border border-white/10 rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <h4 className='text-white font-medium'>{child.name}</h4>
                        {child.description && (
                          <p className='text-gray-400 text-sm mt-1'>
                            {child.description}
                          </p>
                        )}
                        <div className='flex items-center space-x-4 mt-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              child.isActive
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                            {child.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className='text-gray-400 text-xs'>
                            Order: {child.sortOrder}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => handleEditChild(child)}
                          className='p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors'
                          title='Edit Child'>
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id)}
                          className='p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors'
                          title='Delete Child'>
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Child Modal */}
      {showCreateChildModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-gradient-to-br from-[#041932] to-[#041322] border border-white/10 rounded-xl p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-white'>Add New Child</h3>
              <button
                onClick={() => setShowCreateChildModal(false)}
                className='p-2 text-gray-400 hover:text-white transition-colors'>
                <X size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-white text-sm mb-2'>Name</label>
                <input
                  type='text'
                  value={childFormData.name}
                  onChange={(e) =>
                    setChildFormData({ ...childFormData, name: e.target.value })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none'
                  placeholder='Enter child name'
                />
              </div>

              <div>
                <label className='block text-white text-sm mb-2'>
                  Description
                </label>
                <textarea
                  value={childFormData.description}
                  onChange={(e) =>
                    setChildFormData({
                      ...childFormData,
                      description: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none h-20 resize-none'
                  placeholder='Enter child description'
                />
              </div>

              {/*<div className='flex items-center space-x-4'>
                <div>
                  <label className='block text-white text-sm mb-2'>
                    Sort Order
                  </label>
                  <input
                    type='number'
                    value={childFormData.sortOrder}
                    onChange={(e) =>
                      setChildFormData({
                        ...childFormData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#97beda] focus:outline-none'
                  />
                </div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={childFormData.isActive}
                    onChange={(e) =>
                      setChildFormData({
                        ...childFormData,
                        isActive: e.target.checked,
                      })
                    }
                    className='rounded border-gray-300'
                  />
                  <label className='text-white text-sm'>Active</label>
                </div>
              </div>*/}
            </div>

            <div className='flex items-center justify-end space-x-3 mt-6'>
              <button
                onClick={() => setShowCreateChildModal(false)}
                className='px-4 py-2 text-gray-400 hover:text-white transition-colors'>
                Cancel
              </button>
              <button
                onClick={handleSubmitChild}
                className='flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors'>
                <Plus size={16} />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditChildModal && editingChild && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-gradient-to-br from-[#041932] to-[#041322] border border-white/10 rounded-xl p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-white'>Edit Child</h3>
              <button
                onClick={() => {
                  setShowEditChildModal(false);
                  setEditingChild(null);
                }}
                className='p-2 text-gray-400 hover:text-white transition-colors'>
                <X size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-white text-sm mb-2'>Name</label>
                <input
                  type='text'
                  value={childFormData.name}
                  onChange={(e) =>
                    setChildFormData({ ...childFormData, name: e.target.value })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none'
                  placeholder='Enter child name'
                />
              </div>

              <div>
                <label className='block text-white text-sm mb-2'>
                  Description
                </label>
                <textarea
                  value={childFormData.description}
                  onChange={(e) =>
                    setChildFormData({
                      ...childFormData,
                      description: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#97beda] focus:outline-none h-20 resize-none'
                  placeholder='Enter child description'
                />
              </div>

              {/*<div className='flex items-center space-x-4'>
                <div>
                  <label className='block text-white text-sm mb-2'>
                    Sort Order
                  </label>
                  <input
                    type='number'
                    value={childFormData.sortOrder}
                    onChange={(e) =>
                      setChildFormData({
                        ...childFormData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#97beda] focus:outline-none'
                  />
                </div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={childFormData.isActive}
                    onChange={(e) =>
                      setChildFormData({
                        ...childFormData,
                        isActive: e.target.checked,
                      })
                    }
                    className='rounded border-gray-300'
                  />
                  <label className='text-white text-sm'>Active</label>
                </div>
              </div>*/}
            </div>

            <div className='flex items-center justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  setShowEditChildModal(false);
                  setEditingChild(null);
                }}
                className='px-4 py-2 text-gray-400 hover:text-white transition-colors'>
                Cancel
              </button>
              <button
                onClick={handleUpdateChild}
                className='flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors'>
                <FloppyDisk size={16} />
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom gradient transition */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#041322] z-20' />
    </div>
  );
}
