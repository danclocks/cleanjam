/**
 * ===================================
 * FILE PATH: app/dashboard/page.tsx
 * ===================================
 * 
 * Main dashboard page with quick actions and statistics
 * Displays user profile, summary stats, and navigation to key features
 * FIXED: Better error handling, null checks, and data validation
 */

"use client";

import {
  Trash2,
  Calendar,
  Gift,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string | null;
}

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalPoints: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalPoints: 0,
  });
  const [error, setError] = useState("");

  // ==================== FETCH USER & STATS ====================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("📊 [DASHBOARD] Fetching dashboard data...");

        const storedUser = getStoredUser();

        if (!storedUser) {
          console.warn("⚠️ [DASHBOARD] No stored user found");
          router.push("/login");
          return;
        }

        console.log("✅ [DASHBOARD] Stored user found:", storedUser.id);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("user_id, full_name, email, username, avatar_url")
          .eq("auth_id", storedUser.id)
          .single();

        if (profileError) {
          console.error("❌ [DASHBOARD] Profile error:", profileError.message);
          setError("Failed to load user profile");
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.error("❌ [DASHBOARD] No profile data returned");
          setError("User profile not found");
          setLoading(false);
          return;
        }

        console.log("✅ [DASHBOARD] User profile loaded:", profileData.full_name);
        setUserProfile(profileData as UserProfile);

        // Fetch user reports for stats
        console.log("📋 [DASHBOARD] Fetching reports...");
        
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("status")
          .eq("user_id", profileData.user_id);

        if (reportsError) {
          console.warn("⚠️ [DASHBOARD] Reports error:", reportsError.message);
          // Don't fail completely, just continue with 0 reports
        }

        if (reportsData && Array.isArray(reportsData) && reportsData.length > 0) {
          console.log("✅ [DASHBOARD] Reports found:", reportsData.length);

          const totalReports = reportsData.length;
          const pendingReports = reportsData.filter(
            (r) => r.status === "pending"
          ).length;
          const resolvedReports = reportsData.filter(
            (r) => r.status === "resolved"
          ).length;

          // Calculate points: 10 points per resolved report
          const totalPoints = resolvedReports * 10;

          setStats({
            totalReports,
            pendingReports,
            resolvedReports,
            totalPoints,
          });

          console.log("📊 [DASHBOARD] Stats calculated:", {
            totalReports,
            pendingReports,
            resolvedReports,
            totalPoints,
          });
        } else {
          console.log("ℹ️ [DASHBOARD] No reports found, using default stats");
          setStats({
            totalReports: 0,
            pendingReports: 0,
            resolvedReports: 0,
            totalPoints: 0,
          });
        }

        setLoading(false);
        console.log("✅ [DASHBOARD] Dashboard data loaded successfully");
      } catch (error: any) {
        console.error("❌ [DASHBOARD] Error fetching dashboard data:", error.message);
        setError(error.message || "An error occurred loading your dashboard");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
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
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== SUCCESS STATE ====================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Dashboard</h1>
          <p className="text-green-100">Welcome to CleanJamaica</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* User Profile Card */}
        {userProfile ? (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {userProfile.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm opacity-90">Welcome back,</p>
                <p className="text-2xl font-bold">{userProfile.full_name || "User"}</p>
                <p className="text-sm opacity-90">
                  @{userProfile.username || "user"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report an Issue */}
            <Link
              href="/dashboard/reports/new"
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Trash2 className="text-green-600" size={28} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Report an Issue
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Report garbage issues in your area
              </p>
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <Plus size={18} />
                New Report
              </div>
            </Link>

            {/* Pickup Schedule */}
            <Link
              href="/dashboard/schedule"
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Calendar className="text-blue-600" size={28} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pickup Schedule
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                View garbage collection schedules
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Calendar size={18} />
                View Schedule
              </div>
            </Link>

            {/* Redeem Points */}
            <Link
              href="/dashboard/rewards"
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Gift className="text-purple-600" size={28} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Redeem Points
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Earn and redeem points for contributions
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-bold">
                <Gift size={18} />
                View Rewards
              </div>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Your Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Reports */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-600 text-sm font-semibold">
                  Total Reports
                </p>
                <Trash2 className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-black text-gray-900">
                {stats.totalReports}
              </p>
              <p className="text-xs text-gray-500 mt-2">Issues reported</p>
            </div>

            {/* Pending Reports */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <Clock className="text-yellow-600" size={20} />
              </div>
              <p className="text-3xl font-black text-yellow-600">
                {stats.pendingReports}
              </p>
              <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
            </div>

            {/* Resolved Reports */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-600 text-sm font-semibold">Resolved</p>
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-black text-green-600">
                {stats.resolvedReports}
              </p>
              <p className="text-xs text-gray-500 mt-2">Issues resolved</p>
            </div>

            {/* Total Points */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-600 text-sm font-semibold">
                  Total Points
                </p>
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <p className="text-3xl font-black text-purple-600">
                {stats.totalPoints}
              </p>
              <p className="text-xs text-gray-500 mt-2">Points earned</p>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Getting Started
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Report Issues</h3>
                <p className="text-gray-600 text-sm">
                  Found garbage or waste? Click "Report an Issue" to help keep
                  Jamaica clean.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Check Schedules</h3>
                <p className="text-gray-600 text-sm">
                  View pickup schedules for your area to know when waste
                  collection happens.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Earn Rewards</h3>
                <p className="text-gray-600 text-sm">
                  Complete tasks and reports to earn points that can be redeemed
                  for rewards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-md p-8 text-center">
          <h3 className="text-2xl font-black mb-3">Ready to Make a Difference?</h3>
          <p className="mb-6 opacity-90">
            Report garbage issues in your area and help build a cleaner Jamaica
          </p>
          <Link
            href="/dashboard/reports/new"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            <Plus size={20} className="inline mr-2" />
            Report Now
          </Link>
        </div>
      </div>
    </div>
  );
}