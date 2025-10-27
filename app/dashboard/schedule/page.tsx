/**
 * ===================================
 * FILE PATH: app/dashboard/schedule/page.tsx
 * ===================================
 * 
 * Schedule page showing garbage pickup schedules for the user's area
 * with filtering, notifications, and management options
 */

"use client";

import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Filter,
  Bell,
  Eye,
  User as UserIcon,
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

interface Schedule {
  scheduleID: number;
  communityID: string;
  pickupDay: string;
  pickupTime: string;
  frequency: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

type FilterStatus = "all" | "active" | "inactive";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ==================== FETCH SCHEDULES ====================

  useEffect(() => {
    const fetchSchedules = async () => {
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

        // Fetch all schedules (in a real app, you'd filter by user's community)
        let query = supabase
          .from("schedule")
          .select("*")
          .order("pickupDay", { ascending: true });

        if (filterStatus !== "all") {
          query = query.eq("isActive", filterStatus === "active");
        }

        const { data: schedulesData, error: schedulesError } = await query;

        if (schedulesError) {
          console.warn("⚠️ Schedules fetch warning:", schedulesError.message);
          setSchedules([]);
        } else {
          setSchedules(schedulesData as Schedule[]);
        }

        setLoading(false);
      } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [router, filterStatus]);

  // ==================== HELPER FUNCTIONS ====================

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? "✓" : "○";
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: { [key: string]: string } = {
      daily: "bg-blue-100 text-blue-700",
      weekly: "bg-purple-100 text-purple-700",
      biweekly: "bg-indigo-100 text-indigo-700",
      monthly: "bg-cyan-100 text-cyan-700",
    };
    return colors[frequency?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    // Handle different time formats
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch {
      return time;
    }
  };

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading schedules...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
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

  const filteredSchedules =
    filterStatus === "all"
      ? schedules
      : schedules.filter((s) =>
          filterStatus === "active" ? s.isActive : !s.isActive
        );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4 md:px-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar size={32} />
              <h1 className="text-3xl md:text-4xl font-black">Pickup Schedules</h1>
            </div>
          </div>
          <p className="text-green-100">
            View garbage collection schedules for your area
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* User Profile Card */}
        {userProfile && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                {userProfile.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm opacity-90">Viewing schedules for:</p>
                <p className="text-xl font-bold">{userProfile.full_name}</p>
                <p className="text-sm opacity-90">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={24} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Filter Schedules</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as FilterStatus)}
                className={`px-4 py-2 rounded-lg font-semibold transition-smooth ${
                  filterStatus === status
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Schedules Grid */}
        <div className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold text-lg">
                No schedules found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {filterStatus === "all"
                  ? "There are no pickup schedules available"
                  : `No ${filterStatus} schedules available`}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredSchedules.map((schedule) => (
                <div
                  key={schedule.scheduleID}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-green-400 transition-smooth"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar size={20} className="text-green-600" />
                        {schedule.pickupDay}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin size={18} />
                        <span className="capitalize">{schedule.communityID}</span>
                      </div>
                    </div>
                    <div
                      className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${getStatusColor(
                        schedule.isActive
                      )}`}
                    >
                      {getStatusIcon(schedule.isActive)}{" "}
                      {schedule.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Pickup Time */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                        <Clock size={14} />
                        Pickup Time
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatTime(schedule.pickupTime)}
                      </p>
                    </div>

                    {/* Frequency */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Frequency
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getFrequencyColor(
                          schedule.frequency
                        )}`}
                      >
                        {schedule.frequency?.charAt(0).toUpperCase() +
                          schedule.frequency?.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {schedule.notes && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4 mb-6">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> {schedule.notes}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created {new Date(schedule.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      {schedule.isActive && (
                        <button className="text-green-600 font-bold hover:text-green-700 flex items-center gap-1 text-sm">
                          <Bell size={16} />
                          Set Reminder
                        </button>
                      )}
                      <button className="text-gray-600 font-bold hover:text-gray-700 flex items-center gap-1 text-sm">
                        <Eye size={16} />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {schedules.length > 0 && (
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Total Schedules
              </p>
              <p className="text-3xl font-black text-gray-900">
                {schedules.length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm font-semibold mb-1">Active</p>
              <p className="text-3xl font-black text-green-600">
                {schedules.filter((s) => s.isActive).length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Inactive
              </p>
              <p className="text-3xl font-black text-gray-600">
                {schedules.filter((s) => !s.isActive).length}
              </p>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-bold text-green-900 mb-2">📋 Upcoming Pickups</h3>
          <p className="text-green-700 text-sm">
            Schedules are organized by day and time. Check back regularly for any
            changes to pickup times or days in your area. Set reminders to ensure
            you don't miss your collection day!
          </p>
        </div>
      </div>
    </div>
  );
}