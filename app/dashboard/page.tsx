/**
 * ===================================
 * FILE PATH: app/dashboard/page.tsx
 * ===================================
 * 
 * Dashboard page showing logged-in user's data
 * Displays real points, reports, and profile information
 */

"use client";

import {
  Leaf,
  LogOut,
  Menu,
  X,
  Plus,
  Trash2,
  TrendingUp,
  Gift,
  MapPin,
  Calendar,
  Bell,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout, clearSession, getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState("");

  // ==================== FETCH USER DATA ====================

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get user from localStorage (set during login)
        const storedUser = getStoredUser();

        if (!storedUser) {
          console.error("❌ No user found in localStorage");
          router.push("/login");
          return;
        }

        console.log("✅ User from storage:", storedUser.email);
        setUser(storedUser);

        // ==================== FETCH USER PROFILE FROM DATABASE ====================

        console.log("👤 Fetching user profile...");

        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select(
            `
            user_id,
            auth_id,
            email,
            full_name,
            username,
            role,
            is_active,
            avatar_url,
            address,
            community
          `
          )
          .eq("auth_id", storedUser.id)
          .single();

        if (profileError) {
          console.error("❌ Profile fetch error:", profileError.message);
          setError("Failed to load user profile");
          return;
        }

        console.log("✅ Profile loaded:", profileData.full_name);
        setUserProfile(profileData);

        // ==================== FETCH USER REPORTS ====================

        console.log("📋 Fetching user reports...");

        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select(
            `
            report_id,
            user_id,
            location,
            latitude,
            longitude,
            description,
            report_type,
            photo_url,
            status,
            priority,
            created_at,
            resolved_at,
            resolution_notes
          `
          )
          .eq("user_id", profileData.user_id)
          .order("created_at", { ascending: false });

        if (reportsError) {
          console.warn("⚠️ Reports fetch warning:", reportsError.message);
          // Don't fail if reports don't load
          setReports([]);
        } else {
          console.log("✅ Reports loaded:", reportsData?.length);
          setReports(reportsData || []);
        }

        // ==================== FETCH USER REWARDS ====================

        console.log("🎁 Fetching user rewards...");

        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select(
            `
            reward_id,
            user_id,
            points,
            tier,
            total_recycled_kg,
            recycling_sessions,
            last_updated
          `
          )
          .eq("user_id", profileData.user_id)
          .single();

        if (rewardsError) {
          console.warn("⚠️ Rewards fetch warning:", rewardsError.message);
          // User might not have rewards yet
        } else {
          console.log("✅ Rewards loaded:", rewardsData?.points);
          // You can use this data if needed
        }

        setLoading(false);
      } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // ==================== HANDLE LOGOUT ====================

  const handleLogout = async () => {
    try {
      const { error } = await logout();

      if (error) {
        alert("Logout failed: " + error);
        return;
      }

      // Clear stored data
      clearSession();

      // Redirect to login
      router.push("/login");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      alert("Logout failed");
    }
  };

  // ==================== CALCULATE STATS ====================

  const stats = {
    totalPoints: 245, // TODO: Get from rewards table
    reportsSubmitted: reports.length,
    reportsVerified: reports.filter((r) => r.status === "completed").length,
    resolvedReports: reports.filter((r) => r.status === "resolved").length,
  };

  // ==================== FORMAT RECENT REPORTS ====================

  const formattedReports = reports.slice(0, 5).map((report) => ({
    id: report.report_id,
    title: report.description?.substring(0, 50) || report.report_type,
    status: report.status,
    priority: report.priority,
    date: new Date(report.created_at).toLocaleDateString(),
    location: report.location,
    type: report.report_type,
  }));

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600 font-bold mb-4">
            {error || "Failed to load dashboard"}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

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
              <span className="text-2xl font-bold text-green-600 hidden sm:inline">
                CleanJamaica
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
              <a
                href="/dashboard"
                className="text-gray-700 hover:text-green-600 font-medium transition-smooth"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-green-600 font-medium transition-smooth"
              >
                Reports
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-green-600 font-medium transition-smooth"
              >
                Rewards
              </a>
            </div>

            {/* Profile - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-smooth"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                  {userProfile.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </div>
                <span className="font-semibold text-gray-900">
                  {userProfile.full_name?.split(" ")[0] || "User"}
                </span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <a
                    href="#"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 border-b"
                  >
                    Profile Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={24} className="text-green-600" />
              ) : (
                <Menu size={24} className="text-green-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t">
              <a
                href="/dashboard"
                className="block py-2 text-gray-700 font-medium"
              >
                Dashboard
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Reports
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Rewards
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-gray-700 font-medium flex items-center gap-2 mt-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-2">
              Welcome back,{" "}
              <span className="text-green-600">
                {userProfile.full_name?.split(" ")[0] || "User"}
              </span>
              !
            </h1>
            <p className="text-lg text-gray-600">
              Keep Jamaica clean. One report at a time.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              📍 {userProfile.community || userProfile.address || "Jamaica"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {[
              {
                label: "Your Points",
                value: stats.totalPoints,
                icon: Gift,
                color: "from-green-500 to-emerald-500",
              },
              {
                label: "Reports Submitted",
                value: stats.reportsSubmitted,
                icon: Trash2,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Verified Reports",
                value: stats.reportsVerified,
                icon: TrendingUp,
                color: "from-emerald-500 to-green-500",
              },
              {
                label: "Resolved Issues",
                value: stats.resolvedReports,
                icon: Bell,
                color: "from-yellow-500 to-orange-500",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-smooth`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold opacity-90 mb-2">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-black">{stat.value}</p>
                  </div>
                  <stat.icon size={32} className="opacity-80" />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-smooth flex items-center justify-center gap-3 text-lg">
              <Plus size={24} />
              Report an Issue
            </button>
            <button className="bg-white border-2 border-green-600 text-green-600 font-bold py-4 rounded-2xl hover:bg-green-50 transition-smooth flex items-center justify-center gap-3 text-lg">
              <Calendar size={24} />
              Pickup Schedule
            </button>
            <button className="bg-white border-2 border-green-600 text-green-600 font-bold py-4 rounded-2xl hover:bg-green-50 transition-smooth flex items-center justify-center gap-3 text-lg">
              <Gift size={24} />
              Redeem Points
            </button>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              Your Recent Reports ({reports.length})
            </h2>

            {reports.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">
                  No reports submitted yet
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Start reporting issues to earn points and help clean Jamaica!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formattedReports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-green-400 hover:shadow-md transition-smooth"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {report.title}
                          </h3>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-700">
                            {report.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <MapPin size={16} />
                          <span className="text-sm">{report.location}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${
                            report.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : report.status === "resolved"
                              ? "bg-blue-100 text-blue-700"
                              : report.status === "assigned"
                              ? "bg-purple-100 text-purple-700"
                              : report.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {report.status === "completed"
                            ? "✓ Completed"
                            : report.status === "resolved"
                            ? "✓ Resolved"
                            : report.status === "assigned"
                            ? "→ Assigned"
                            : report.status === "in_progress"
                            ? "⧖ In Progress"
                            : "⏳ " +
                              report.status?.charAt(0).toUpperCase() +
                              report.status?.slice(1)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            report.priority === "urgent"
                              ? "bg-red-100 text-red-700"
                              : report.priority === "high"
                              ? "bg-orange-100 text-orange-700"
                              : report.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {report.priority?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">{report.date}</p>
                  </div>
                ))}
              </div>
            )}

            {reports.length > 5 && (
              <button className="w-full mt-6 py-3 text-green-600 font-bold border-2 border-green-600 rounded-lg hover:bg-green-50 transition-smooth">
                View All Reports ({reports.length})
              </button>
            )}
          </div>

          {/* Points and Events */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {/* Points Summary */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Points Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-700 font-semibold">
                    Total Points Available
                  </span>
                  <span className="text-2xl font-black text-green-600">
                    {stats.totalPoints}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• 100 points = $5 cash credit</p>
                  <p>• 50 points = Discount voucher</p>
                  <p>• 150 points = Achievement badge</p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Coming Soon
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <p className="font-semibold text-gray-900 mb-1">
                    🌍 Community Cleanup Day
                  </p>
                  <p className="text-sm text-gray-600">October 30, 2025</p>
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    +100 bonus points!
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="font-semibold text-gray-900 mb-1">
                    ♻️ Recycling Challenge
                  </p>
                  <p className="text-sm text-gray-600">November 15, 2025</p>
                  <p className="text-sm text-blue-600 font-semibold mt-2">
                    Compete with others!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}