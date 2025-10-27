/**
 * ===================================
 * FILE PATH: app/dashboard/rewards/page.tsx
 * ===================================
 * 
 * Rewards page showing available rewards and redemption options
 */

"use client";

import { Gift, AlertCircle, TrendingUp, Award, Lock, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

interface UserRewards {
  reward_id: string;
  user_id: string;
  points: number;
  tier: string;
  total_recycled_kg: number;
  recycling_sessions: number;
  last_updated: string;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: string;
  icon: string;
}

export default function RewardsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [error, setError] = useState("");

  // Sample reward items
  const availableRewards: RewardItem[] = [
    {
      id: "1",
      name: "Cash Credit",
      description: "$5 cash credit to your account",
      pointsRequired: 100,
      category: "money",
      icon: "💵",
    },
    {
      id: "2",
      name: "Discount Voucher",
      description: "10% discount on eco-friendly products",
      pointsRequired: 50,
      category: "discount",
      icon: "🎟️",
    },
    {
      id: "3",
      name: "Achievement Badge",
      description: "Digital badge for your profile",
      pointsRequired: 150,
      category: "badge",
      icon: "🏅",
    },
    {
      id: "4",
      name: "Premium Membership",
      description: "1 month of premium features",
      pointsRequired: 250,
      category: "membership",
      icon: "👑",
    },
    {
      id: "5",
      name: "Free Cleanup Kit",
      description: "Complete recycling starter pack",
      pointsRequired: 200,
      category: "product",
      icon: "📦",
    },
    {
      id: "6",
      name: "Tree Planting",
      description: "Plant a tree in your name",
      pointsRequired: 300,
      category: "environmental",
      icon: "🌳",
    },
  ];

  // ==================== FETCH REWARDS ====================

  useEffect(() => {
    const fetchRewards = async () => {
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
          .select("user_id")
          .eq("auth_id", storedUser.id)
          .single();

        if (profileError || !profileData) {
          setError("Failed to load user profile");
          setLoading(false);
          return;
        }

        // Fetch rewards
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

    fetchRewards();
  }, [router]);

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading rewards...</p>
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

  const userPoints = rewards?.points || 0;
  const redeemableRewards = availableRewards.filter((r) => userPoints >= r.pointsRequired);
  const lockedRewards = availableRewards.filter((r) => userPoints < r.pointsRequired);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Gift size={32} />
            <h1 className="text-4xl font-black">Rewards Center</h1>
          </div>
          <p className="text-green-100">Redeem your points for amazing rewards</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Points Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90 mb-2">Your Points</p>
                <p className="text-5xl font-black">{userPoints}</p>
              </div>
              <Gift size={40} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90 mb-2">Current Tier</p>
                <p className="text-5xl font-black">{rewards?.tier || "Bronze"}</p>
              </div>
              <Award size={40} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90 mb-2">Recycled</p>
                <p className="text-5xl font-black">{rewards?.total_recycled_kg.toFixed(1)}</p>
                <p className="text-sm opacity-75">kg</p>
              </div>
              <TrendingUp size={40} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Redeemable Rewards */}
        {redeemableRewards.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              ✨ Available Rewards
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {redeemableRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white rounded-2xl shadow-md border-2 border-green-300 p-6 hover:shadow-lg transition-smooth"
                >
                  <div className="text-5xl mb-4">{reward.icon}</div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {reward.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                      {reward.pointsRequired} pts
                    </span>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-full font-bold hover:bg-green-700 transition-smooth">
                      Redeem
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Rewards */}
        {lockedRewards.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              🔒 Locked Rewards
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {lockedRewards.map((reward) => {
                const pointsNeeded = reward.pointsRequired - userPoints;
                return (
                  <div
                    key={reward.id}
                    className="bg-gray-100 rounded-2xl shadow-md border-2 border-gray-300 p-6 opacity-60"
                  >
                    <div className="text-5xl mb-4 opacity-50">{reward.icon}</div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      {reward.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock size={18} className="text-gray-500" />
                        <span className="text-sm font-bold text-gray-700">
                          {pointsNeeded} more
                        </span>
                      </div>
                      <span className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-bold">
                        {reward.pointsRequired} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How to Earn Points */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <Zap className="text-yellow-500" size={32} />
            How to Earn Points
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-4xl font-black text-gray-900 mb-2">+10</p>
              <p className="text-gray-700 font-semibold">Report an issue</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-4xl font-black text-gray-900 mb-2">+25</p>
              <p className="text-gray-700 font-semibold">Verified report</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-4xl font-black text-gray-900 mb-2">+50</p>
              <p className="text-gray-700 font-semibold">Complete recycling</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}