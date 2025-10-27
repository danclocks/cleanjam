/**
 * ===================================
 * FILE PATH: app/dashboard/users/page.tsx
 * ===================================
 * 
 * Users/Leaderboard page showing top contributors
 * and community members
 */

"use client";

import {
  Users as UsersIcon,
  AlertCircle,
  Award,
  TrendingUp,
  Trophy,
  Zap,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

interface User {
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  avatar_url: string | null;
  address: string;
  community: string;
}

interface UserStats {
  user_id: string;
  points: number;
  total_reports: number;
  total_recycled_kg: number;
  recycling_sessions: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<(User & { stats?: UserStats })[]>([]);
  const [leaderboard, setLeaderboard] = useState<(User & { stats: UserStats })[]>([]);
  const [error, setError] = useState("");
  const [filterBy, setFilterBy] = useState<"points" | "reports" | "recycled">("points");

  // ==================== FETCH USERS ====================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = getStoredUser();

        if (!storedUser) {
          router.push("/login");
          return;
        }

        // Fetch all active users
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .eq("is_active", true)
          .order("full_name", { ascending: true });

        if (usersError) {
          console.warn("⚠️ Users fetch warning:", usersError.message);
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch rewards for each user
        const usersWithStats = await Promise.all(
          usersData.map(async (user) => {
            const { data: statsData } = await supabase
              .from("rewards")
              .select("*")
              .eq("user_id", user.user_id)
              .single();

            return {
              ...user,
              stats: statsData || {
                points: 0,
                total_reports: 0,
                total_recycled_kg: 0,
                recycling_sessions: 0,
              },
            };
          })
        );

        setUsers(usersWithStats as any);

        // Sort for leaderboard
        let sorted = [...usersWithStats];
        if (filterBy === "points") {
          sorted.sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));
        } else if (filterBy === "reports") {
          sorted.sort(
            (a, b) => (b.stats?.total_reports || 0) - (a.stats?.total_reports || 0)
          );
        } else {
          sorted.sort(
            (a, b) =>
              (b.stats?.total_recycled_kg || 0) - (a.stats?.total_recycled_kg || 0)
          );
        }

        setLeaderboard(sorted.slice(0, 20) as any);
        setLoading(false);
      } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router, filterBy]);

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading users...</p>
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

  // ==================== HELPER FUNCTIONS ====================

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `${rank + 1}`;
  };

  const getTierBadge = (points: number) => {
    if (points >= 2000) return { name: "Platinum", color: "bg-blue-100 text-blue-700" };
    if (points >= 1000) return { name: "Gold", color: "bg-yellow-100 text-yellow-700" };
    if (points >= 500) return { name: "Silver", color: "bg-slate-100 text-slate-700" };
    return { name: "Bronze", color: "bg-amber-100 text-amber-700" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={32} />
            <h1 className="text-4xl font-black">Community Leaderboard</h1>
          </div>
          <p className="text-green-100">Top contributors helping clean Jamaica</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Filter Buttons */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <p className="text-sm text-gray-600 font-semibold mb-4">Sort By:</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilterBy("points")}
              className={`px-4 py-2 rounded-lg font-bold transition-smooth ${
                filterBy === "points"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Award size={18} className="inline mr-2" />
              Points
            </button>
            <button
              onClick={() => setFilterBy("reports")}
              className={`px-4 py-2 rounded-lg font-bold transition-smooth ${
                filterBy === "reports"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Zap size={18} className="inline mr-2" />
              Reports
            </button>
            <button
              onClick={() => setFilterBy("recycled")}
              className={`px-4 py-2 rounded-lg font-bold transition-smooth ${
                filterBy === "recycled"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TrendingUp size={18} className="inline mr-2" />
              Recycled
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Top 20 Contributors
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold text-lg">No users found</p>
            </div>
          ) : (
            <div className="space-y-0">
              {leaderboard.map((user, index) => {
                const tier = getTierBadge(user.stats?.points || 0);
                return (
                  <div
                    key={user.user_id}
                    className="border-b border-gray-200 last:border-b-0 p-6 hover:bg-gray-50 transition-smooth"
                  >
                    <div className="flex items-center justify-between">
                      {/* Rank and User Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-black text-lg">
                          {getMedalIcon(index)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-black text-gray-900">
                              {user.full_name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-bold ${tier.color}`}
                            >
                              {tier.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          <p className="text-xs text-gray-500 mt-1">{user.community}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-6 text-right">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">
                            Points
                          </p>
                          <p className="text-2xl font-black text-green-600">
                            {user.stats?.points || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">
                            Reports
                          </p>
                          <p className="text-2xl font-black text-blue-600">
                            {user.stats?.total_reports || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">
                            Recycled
                          </p>
                          <p className="text-2xl font-black text-purple-600">
                            {(user.stats?.total_recycled_kg || 0).toFixed(0)} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Total Community Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Users</p>
            <p className="text-4xl font-black text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Points</p>
            <p className="text-4xl font-black text-green-600">
              {users.reduce((sum, u) => sum + (u.stats?.points || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Reports</p>
            <p className="text-4xl font-black text-blue-600">
              {users.reduce((sum, u) => sum + (u.stats?.total_reports || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Recycled</p>
            <p className="text-4xl font-black text-purple-600">
              {users.reduce((sum, u) => sum + (u.stats?.total_recycled_kg || 0), 0).toFixed(0)} kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}