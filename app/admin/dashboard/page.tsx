/**
 * ================================================================
 * FILE PATH: app/dashboard/admin/page.tsx
 * 
 * ADMIN DASHBOARD - With Sign Out Functionality
 * ================================================================
 */

"use client";

import {
  Leaf,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Trash2,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  Settings,
  LogOut,
  Loader,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { logout } from "@/lib/auth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AdminUser {
  user_id: number;
  email: string;
  full_name: string;
  role: "admin" | "supadmin";
  avatar: string;
}

interface Report {
  report_id: string;
  location_community: string;
  report_type: string;
  status: string;
  priority: string;
  user_created_at: string;
  reporter_name: string;
  reporter_email: string;
}

interface DashboardData {
  success: boolean;
  admin: AdminUser;
  statistics: {
    totalReports: number;
    resolvedReports: number;
    inProgressReports: number;
    pendingReports: number;
  };
  reports: Report[];
  charts: {
    reportStatusData: { name: string; value: number; color: string }[];
    priorityBreakdown: { name: string; value: number; color: string }[];
    reportTypeBreakdown: { type: string; count: number }[];
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminDashboard() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // ============================================
  // FETCH DASHBOARD DATA FROM API
  // ============================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setAccessDenied(false);

        console.log("📡 [Page] Getting session...");
        // Get the session from client
        const { data: { session } } = await supabase.auth.getSession();
        console.log("📡 [Page] Session found?", !!session);

        if (!session) {
          console.error("❌ [Page] No session available");
          router.push("/login");
          return;
        }

        console.log("📡 [Page] Calling /api/admin/dashboard with auth token...");

        const response = await fetch("/api/admin/dashboard", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
        });

        setStatusCode(response.status);
        const data = await response.json();

        // ============================================
        // HANDLE API RESPONSES
        // ============================================
        console.log("📡 [Page] Getting session...");
        // const { data: { session } } = await supabase.auth.getSession();
        console.log("📡 [Page] Session user email:", session?.user?.email);
        console.log("📡 [Page] Session user ID:", session?.user?.id);

        if (response.status === 401) {
          console.error("❌ [Page] Unauthorized - not authenticated");
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          console.error("❌ [Page] Forbidden - not an admin user");
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          console.error("❌ [Page] API error:", data.error);
          throw new Error(data.error || "Failed to fetch dashboard data");
        }

        console.log("✅ [Page] Dashboard data received successfully");
        setDashboardData(data);
      } catch (err: any) {
        console.error("❌ [Page] Error loading dashboard:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // ============================================
  // HANDLE SIGN OUT (NEW)
  // ============================================
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      console.log("👋 [DASHBOARD] Initiating sign out...");

      await logout();

      console.log("✅ [DASHBOARD] Sign out successful!");
      // logout() redirects to home automatically, but just in case:
      router.push("/");
    } catch (error: any) {
      console.error("❌ [DASHBOARD] Sign out error:", error.message);
      alert("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // ACCESS DENIED STATE
  // ============================================
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the admin dashboard. This page
            is for admin and supadmin users only.
          </p>
          <a
            href="/dashboard/reports"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
          >
            Go to Reports
          </a>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Error Loading Dashboard
          </h1>
          <p className="text-gray-600 mb-4 font-mono text-sm break-words">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // NO DATA STATE
  // ============================================
  if (!dashboardData) {
    return null;
  }

  // ============================================
  // EXTRACT DATA FOR DISPLAY
  // ============================================
  const { admin, statistics, reports, charts } = dashboardData;
  const { totalReports, resolvedReports, inProgressReports, pendingReports } =
    statistics;

  // Key metrics for cards
  const metrics = [
    {
      label: "Total Reports",
      value: totalReports.toString(),
      change: "+12%",
      icon: Trash2,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Resolved",
      value: resolvedReports.toString(),
      change: "+8%",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "In Progress",
      value: inProgressReports.toString(),
      change: "+15%",
      icon: Clock,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Pending",
      value: pendingReports.toString(),
      change: "-3%",
      icon: AlertCircle,
      color: "from-orange-500 to-yellow-500",
    },
  ];

  // ============================================
  // RENDER DASHBOARD
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gradient hidden sm:inline">
                CleanJamaica
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold ml-2">
                {admin.role === "supadmin" ? "SUPADMIN" : "ADMIN"}
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center text-sm">
              <a
                href="/admin/dashboard"
                className="text-green-600 hover:text-green-700 font-bold"
              >
                Dashboard
              </a>
              <a href="/admin/dashboard/reports" className="text-gray-700 hover:text-green-600 font-medium">
                Reports
              </a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium">
                Officers
              </a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium">
                Users
              </a>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {admin.avatar}
                  </div>
                  <ChevronDown size={18} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="bg-red-600 text-white p-3 border-b">
                      <p className="font-bold text-sm">{admin.full_name}</p>
                      <p className="text-xs opacity-90">{admin.email}</p>
                      <p className="text-xs mt-1 opacity-75">
                        Role: {admin.role.toUpperCase()}
                      </p>
                    </div>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      <Settings className="inline mr-2" size={16} />
                      Settings
                    </a>
                    <a
                      href="/dashboard/reports"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm border-t"
                    >
                      Go to User Dashboard
                    </a>
                    {/* ✨ SIGN OUT BUTTON - NOW ACTIVE */}
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm border-t disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <LogOut className="inline mr-2" size={16} />
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>

              <button
                className="md:hidden text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t">
              <a href="/admin/dashboard" className="block py-2 text-green-600 font-bold">
                Dashboard
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Reports
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Officers
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Users
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-2">
              NSWMA <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-lg text-gray-600">
              Real-time waste management operations overview • Viewing all
              reports from all residents
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${metric.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        {metric.label}
                      </p>
                      <p className="text-3xl font-black mt-2">{metric.value}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {metric.change} vs last week
                      </p>
                    </div>
                    <IconComponent size={32} className="opacity-80" />
                  </div>
                  <div className="w-full bg-white bg-opacity-20 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-3/4 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Report Status Pie Chart */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-purple-600" />
                Report Status Distribution
              </h2>
              {charts.reportStatusData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={charts.reportStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {charts.reportStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  No reports yet
                </div>
              )}
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle size={24} className="text-red-600" />
                Priority Breakdown
              </h2>
              <div className="space-y-4">
                {charts.priorityBreakdown.map((priority, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <p className="font-semibold text-gray-900">
                        {priority.name}
                      </p>
                      <p className="font-black text-gray-700">{priority.value}</p>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(priority.value / (totalReports || 1)) * 100}%`,
                          backgroundColor: priority.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Reports Table */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-x-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              All Reports ({totalReports})
            </h2>

            {reports.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-black text-gray-900">
                          Report ID
                        </th>
                        <th className="text-left py-3 px-4 font-black text-gray-900">
                          Location
                        </th>
                        <th className="text-left py-3 px-4 font-black text-gray-900">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-black text-gray-900">
                          Reporter
                        </th>
                        <th className="text-left py-3 px-4 font-black text-gray-900">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-black text-gray-900">
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 font-black text-gray-900">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.slice(0, 20).map((report) => (
                        <tr
                          key={report.report_id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-4 px-4 font-semibold text-blue-600">
                            {report.report_id}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {report.location_community}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {report.report_type}
                          </td>
                          <td className="py-4 px-4 text-gray-800 truncate">
                            <div className="text-sm">
                              <p className="font-medium">{report.reporter_name}</p>
                              <p className="text-gray-500 text-xs">
                                {report.reporter_email}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                report.status === "resolved"
                                  ? "bg-green-100 text-green-700"
                                  : report.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {report.status === "resolved"
                                ? "✓ Resolved"
                                : report.status === "in_progress"
                                ? "⏳ In Progress"
                                : "⏱️ Pending"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                report.priority === "critical"
                                  ? "bg-red-100 text-red-700"
                                  : report.priority === "high"
                                  ? "bg-orange-100 text-orange-700"
                                  : report.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {report.priority?.toUpperCase() || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(report.user_created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reports.length > 20 && (
                  <button className="w-full mt-6 py-3 text-green-600 font-bold border-2 border-green-600 rounded-lg hover:bg-green-50 transition">
                    View All Reports ({reports.length})
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No reports yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}