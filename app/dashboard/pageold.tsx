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
import { useState } from "react";

export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Mock data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
    points: 245,
    reportsSubmitted: 12,
    reportsVerified: 8,
  };

  const recentReports = [
    {
      id: 1,
      title: "Uncollected Garbage - Oak Avenue",
      status: "verified",
      points: 25,
      date: "2 hours ago",
      location: "Oak Avenue, Kingston",
    },
    {
      id: 2,
      title: "Illegal Dumping Site",
      status: "pending",
      points: 10,
      date: "1 day ago",
      location: "Industrial Park, Spanish Town",
    },
    {
      id: 3,
      title: "Blocked Drainage",
      status: "resolved",
      points: 25,
      date: "3 days ago",
      location: "Hope Road, Kingston",
    },
  ];

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
                  {user.avatar}
                </div>
                <span className="font-semibold text-gray-900">{user.name}</span>
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
                  <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
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
              <a href="/dashboard" className="block py-2 text-gray-700 font-medium">
                Dashboard
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Reports
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Rewards
              </a>
              <button className="w-full text-left py-2 text-gray-700 font-medium flex items-center gap-2 mt-2">
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
              Welcome back, <span className="text-gradient">{user.name}!</span>
            </h1>
            <p className="text-lg text-gray-600">
              Keep Jamaica clean. One report at a time.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {[
              {
                label: "Your Points",
                value: user.points,
                icon: Gift,
                color: "from-green-500 to-emerald-500",
              },
              {
                label: "Reports Submitted",
                value: user.reportsSubmitted,
                icon: Trash2,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Verified Reports",
                value: user.reportsVerified,
                icon: TrendingUp,
                color: "from-emerald-500 to-green-500",
              },
              {
                label: "Rank",
                value: "Silver",
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
              Your Recent Reports
            </h2>

            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-green-400 hover:shadow-md transition-smooth"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin size={16} />
                        <span className="text-sm">{report.location}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          report.status === "verified"
                            ? "bg-green-100 text-green-700"
                            : report.status === "resolved"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {report.status === "verified"
                          ? "✓ Verified"
                          : report.status === "resolved"
                          ? "✓ Resolved"
                          : "⏳ Pending"}
                      </span>
                      <span className="text-sm text-gray-600">
                        +{report.points} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">{report.date}</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 text-green-600 font-bold border-2 border-green-600 rounded-lg hover:bg-green-50 transition-smooth">
              View All Reports
            </button>
          </div>

          {/* Points Breakdown */}
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
                    {user.points}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    • 100 points = $5 cash credit
                  </p>
                  <p>
                    • 50 points = Discount voucher
                  </p>
                  <p>
                    • 150 points = Achievement badge
                  </p>
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