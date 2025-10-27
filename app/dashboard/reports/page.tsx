/**
 * ===================================
 * FILE PATH: app/dashboard/reports/page.tsx
 * ===================================
 * 
 * Reports listing page showing all user's garbage reports
 * with filtering, status tracking, and management options
 * MODIFIED: Now displays logged-in user information in header
 */

"use client";

import {
  Trash2,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Eye,
  User,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

interface Report {
  report_id: string;
  user_id: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  report_type: string;
  photo_url: string | null;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string | null;
}

type FilterStatus = "all" | "pending" | "assigned" | "in_progress" | "completed" | "resolved";

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ==================== FETCH REPORTS & USER ====================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = getStoredUser();

        if (!storedUser) {
          router.push("/login");
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("user_id, full_name, email, username, avatar_url")
          .eq("auth_id", storedUser.id)
          .single();

        if (profileError || !profileData) {
          setError("Failed to load user profile");
          setLoading(false);
          return;
        }

        setUserProfile(profileData as UserProfile);

        // Fetch all reports
        let query = supabase
          .from("reports")
          .select("*")
          .eq("user_id", profileData.user_id)
          .order("created_at", { ascending: false });

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus);
        }

        const { data: reportsData, error: reportsError } = await query;

        if (reportsError) {
          console.warn("⚠️ Reports fetch warning:", reportsError.message);
          setReports([]);
        } else {
          setReports(reportsData as Report[]);
        }

        setLoading(false);
      } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, [router, filterStatus]);

  // ==================== HELPER FUNCTIONS ====================

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-700",
      assigned: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      completed: "bg-green-100 text-green-700",
      resolved: "bg-emerald-100 text-emerald-700",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "resolved":
        return "✓";
      case "in_progress":
        return "⧖";
      case "assigned":
        return "→";
      default:
        return "⏳";
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      urgent: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading reports...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-bold text-red-900">Error</h3>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredReports =
    filterStatus === "all"
      ? reports
      : reports.filter((r) => r.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            {/* Left Section */}
            <div className="flex items-center gap-3 min-w-0">
              <Trash2 size={32} className="flex-shrink-0" />
              <h1 className="text-3xl md:text-4xl font-black truncate">My Reports</h1>
            </div>

            {/* Right Section - New Report & User Menu */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                href="/dashboard/reports/new"
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-smooth"
              >
                <Plus size={20} className="inline mr-2" />
                New Report
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative">
               

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-bold text-gray-900">
                        {userProfile?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {userProfile?.email || ""}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} className="inline mr-2" />
                        View Profile
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-green-100">Track all your garbage issue reports</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={24} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Filter Reports</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {["all", "pending", "assigned", "in_progress", "completed", "resolved"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as FilterStatus)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-smooth ${
                    filterStatus === status
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
              <Trash2 size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold text-lg">No reports found</p>
              <p className="text-gray-500 text-sm mt-2">
                {filterStatus === "all"
                  ? "Start by reporting an issue to help clean Jamaica!"
                  : `No reports with status "${filterStatus.replace("_", " ")}"`}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <Link key={report.report_id} href={`/dashboard/reports/${report.report_id}`}>
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-green-400 transition-smooth cursor-pointer">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Section */}
                    <div>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {report.description?.substring(0, 60) || report.report_type}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin size={18} />
                            <span>{report.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={18} />
                            <span>
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-700 font-semibold">
                          {report.report_type}
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${getPriorityColor(
                            report.priority
                          )}`}
                        >
                          {report.priority?.toUpperCase() || "NORMAL"}
                        </span>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col justify-between">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Status</p>
                        <div
                          className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {getStatusIcon(report.status)}{" "}
                          {report.status?.replace("_", " ").toUpperCase()}
                        </div>
                      </div>

                      {report.resolved_at && (
                        <div className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle size={18} />
                          <span>
                            Resolved on{" "}
                            {new Date(report.resolved_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="text-right mt-4">
                        <button className="text-green-600 font-bold hover:text-green-700 flex items-center justify-end gap-2">
                          View Details
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Reports</p>
            <p className="text-3xl font-black text-gray-900">{reports.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-1">Pending</p>
            <p className="text-3xl font-black text-yellow-600">
              {reports.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-1">In Progress</p>
            <p className="text-3xl font-black text-purple-600">
              {reports.filter((r) => r.status === "in_progress").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-1">Resolved</p>
            <p className="text-3xl font-black text-green-600">
              {reports.filter((r) => r.status === "resolved").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}