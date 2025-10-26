"use client";

import { useState } from "react";
import {
  Leaf,
  Home,
  Trash2,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
  };

  // Navigation items
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/reports", label: "Reports", icon: Trash2 },
    { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
    { href: "/dashboard/schedule", label: "Schedule", icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-700 hover:text-green-600 transition-smooth"
              >
                {isSidebarOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
                )}
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Leaf className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-gradient hidden sm:inline">
                  CleanJamaica
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-smooth flex items-center gap-2 ${
                    isActive(item.href)
                      ? "bg-green-100 text-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-smooth"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {user.avatar}
                </div>
                <span className="font-semibold text-gray-900 hidden sm:inline">
                  {user.name}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* User Info */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                    <p className="font-bold text-lg">{user.name}</p>
                    <p className="text-sm opacity-90">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <a
                      href="#"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium transition-smooth"
                    >
                      <Settings className="inline mr-2" size={18} />
                      Profile Settings
                    </a>
                    <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium transition-smooth border-t">
                      <LogOut className="inline mr-2" size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="absolute left-0 top-16 h-screen w-64 bg-white shadow-lg pt-4">
            <nav className="space-y-2 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-smooth ${
                    isActive(item.href)
                      ? "bg-green-100 text-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16">{children}</main>
    </div>
  );
}