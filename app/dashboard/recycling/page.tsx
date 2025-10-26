/**
 * ===================================
 * FILE PATH: app/dashboard/recycling/page.tsx
 * ===================================
 * 
 * Recycling page showing user's recycling stats,
 * sessions, and rewards tracking
 */

"use client";

import {
  Leaf,
  Trash2,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

interface RecyclingSession {
  session_id: string;
  user_id: string;
  weight_kg: number;
  material_type: string;
  location: string;
  verified: boolean;
  points_earned: number;
  created_at: string;
}

interface UserRewards {
  reward_id: string;
  user_id: string;
  points: number;
  tier: string;
  total_recycled_kg: number;
  recycling_sessions: number;
  last_updated: string;
}

export default function RecyclingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<RecyclingSession[]>([]);
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [error, setError] = useState("");

  // ==================== FETCH RECYCLING DATA ====================

  useEffect(() => {
    const fetchRecyclingData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get stored user
        const storedUser = getStoredUser();

        if (!storedUser) {
          router.push("/login");
          return;
        }

        setUser(storedUser);

        // Fetch user profile to get user_id
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("user_id")
          .eq("auth_id", storedUser.id)
          .single();

        if (profileError || !profileData) {
          setError("Failed to load user profile");
          setLoading(false);
          return;
        }

        // Fetch recycling sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("recycling_sessions")
          .select("*")
          .eq("user_id", profileData.user_id)
          .order("created_at", { ascending: false });

        if (sessionsError) {
          console.warn("⚠️ Sessions fetch warning:", sessionsError.message);
          setSessions([]);
        } else {
          setSessions(sessionsData || []);
        }

        // Fetch rewards data
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select("*")
          .eq("user_id", profileData.user_id)
          .single();

        if (rewardsError) {
          console.warn("⚠️ Rewards fetch warning:", rewardsError.message);
          setRewards(null);
        } else {
          setRewards(rewardsData as UserRewards);
        }

        setLoading(false);
      } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchRecyclingData();
  }, [router]);

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading recycling data...</p>
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

  // ==================== CALCULATE STATS ====================

  const stats = {
    totalPoints: rewards?.points || 0,
    totalKgRecycled: rewards?.total_recycled_kg || 0,
    sessionsCompleted: rewards?.recycling_sessions || 0,
    tier: rewards?.tier || "Bronze",
    averagePerSession:
      (rewards?.recycling_sessions || 0) > 0
        ? (rewards?.total_recycled_kg || 0) / (rewards?.recycling_sessions || 0)
        : 0,
  };

  // ==================== FORMAT RECENT SESSIONS ====================

  const recentSessions = sessions.slice(0, 10);

  const getMaterialColor = (material: string) => {
    const colors: { [key: string]: string } = {
      plastic: "bg-blue-100 text-blue-700",
      paper: "bg-yellow-100 text-yellow-700",
      metal: "bg-gray-100 text-gray-700",
      glass: "bg-emerald-100 text-emerald-700",
      organic: "bg-green-100 text-green-700",
      mixed: "bg-purple-100 text-purple-700",
    };
    return colors[material?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getTierColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      bronze: "from-amber-500 to-amber-600",
      silver: "from-slate-400 to-slate-500",
      gold: "from-yellow-400 to-yellow-500",
      platinum: "from-blue-400 to-blue-500",
    };
    return colors[tier?.toLowerCase()] || "from-amber-500 to-amber-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Leaf size={32} />
            <h1 className="text-4xl font-black">Recycling Dashboard</h1>
          </div>
          <p className="text-green-100">Track your recycling impact and earn rewards</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Key Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {/* Tier */}
          <div
            className={`bg-gradient-to-br ${getTierColor(stats.tier)} p-6 rounded-2xl text-white shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90 mb-2">Current Tier</p>
                <p className="text-4xl font-black">{stats.tier}</p>
              </div>
              <Award size={32} className="opacity-80" />
            </div>
          </div>

          {/* Total Points */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90 mb-2">Total Points</p>
                <p className="text-4xl font-black">{stats.totalPoints}</p>
              </div>
              <TrendingUp size={32} className="opacity-80" />
            </div>
          </div>

          {/* Total Kg Recycled */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90 mb-2">Total Recycled</p>
                <p className="text-4xl font-black">{stats.totalKgRecycled.toFixed(1)}</p>
                <p className="text-sm opacity-75 mt-1">kg</p>
              </div>
              <Trash2 size={32} className="opacity-80" />
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90 mb-2">Sessions</p>
                <p className="text-4xl font-black">{stats.sessionsCompleted}</p>
              </div>
              <CheckCircle size={32} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Points Summary */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-green-600" size={28} />
              <h2 className="text-2xl font-black text-gray-900">Points Breakdown</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700 font-semibold">Points Available</span>
                <span className="text-2xl font-black text-green-600">{stats.totalPoints}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 100 points = $5 cash credit</p>
                <p>• 50 points = Discount voucher</p>
                <p>• 150 points = Achievement badge</p>
                <p>• 200+ points = Special rewards</p>
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="text-green-600" size={28} />
              <h2 className="text-2xl font-black text-gray-900">Environmental Impact</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700 font-semibold">Material Recycled</span>
                <span className="text-2xl font-black text-green-600">
                  {stats.totalKgRecycled.toFixed(1)} kg
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  🌍 Equivalent to saving {(stats.totalKgRecycled * 0.05).toFixed(1)} kg CO₂
                </p>
                <p>♻️ Sessions completed: {stats.sessionsCompleted}</p>
                <p>
                  📊 Average per session: {stats.averagePerSession.toFixed(2)} kg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            Recent Recycling Sessions ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Trash2 size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">No recycling sessions yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Start recycling to earn points and help the environment!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.session_id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-green-400 hover:shadow-md transition-smooth"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getMaterialColor(
                            session.material_type
                          )}`}
                        >
                          {session.material_type?.toUpperCase()}
                        </span>
                        {session.verified && (
                          <CheckCircle className="text-green-600" size={18} />
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">
                        📍 {session.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-900">
                          {session.weight_kg} kg
                        </span>{" "}
                        recycled
                      </span>
                      <span className="text-gray-600">
                        📅{" "}
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xl font-black text-green-600">
                          {session.points_earned}
                        </span>
                        <p className="text-xs text-gray-500">points earned</p>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-bold ${
                          session.verified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {session.verified ? "✓ Verified" : "⏳ Pending"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessions.length > 10 && (
            <button className="w-full mt-6 py-3 text-green-600 font-bold border-2 border-green-600 rounded-lg hover:bg-green-50 transition-smooth flex items-center justify-center gap-2">
              View All Sessions ({sessions.length})
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Rewards Tier Information */}
        <div className="mt-10 bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Rewards Tiers</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                name: "Bronze",
                minPoints: 0,
                color: "bg-amber-50 border-amber-200",
              },
              {
                name: "Silver",
                minPoints: 500,
                color: "bg-slate-50 border-slate-200",
              },
              { name: "Gold", minPoints: 1000, color: "bg-yellow-50 border-yellow-200" },
              {
                name: "Platinum",
                minPoints: 2000,
                color: "bg-blue-50 border-blue-200",
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`border-2 ${tier.color} rounded-lg p-4 text-center`}
              >
                <p className="font-bold text-gray-900">{tier.name}</p>
                <p className="text-sm text-gray-600">{tier.minPoints}+ points</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}