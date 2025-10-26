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
} from "lucide-react";
import { useState } from "react";
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

export default function AdminDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Mock admin user
  const admin = {
    name: "Admin User",
    email: "admin@nswma.gov.jm",
    avatar: "AU",
  };

  // Chart data - Reports over time
  const reportsOverTime = [
    { date: "Oct 20", reports: 45, resolved: 32 },
    { date: "Oct 21", reports: 52, resolved: 38 },
    { date: "Oct 22", reports: 48, resolved: 35 },
    { date: "Oct 23", reports: 61, resolved: 44 },
    { date: "Oct 24", reports: 58, resolved: 42 },
    { date: "Oct 25", reports: 67, resolved: 51 },
  ];

  // Report status distribution
  const reportStatus = [
    { name: "Resolved", value: 342, color: "#10b981" },
    { name: "In Progress", value: 128, color: "#3b82f6" },
    { name: "Pending", value: 95, color: "#f59e0b" },
    { name: "Unverified", value: 61, color: "#ef4444" },
  ];

  // Top problem areas
  const topAreas = [
    { area: "Kingston Central", reports: 145, color: "#ef4444" },
    { area: "Spanish Town", reports: 98, color: "#f97316" },
    { area: "Montego Bay", reports: 87, color: "#eab308" },
    { area: "Port Royal", reports: 72, color: "#84cc16" },
    { area: "May Pen", reports: 65, color: "#22c55e" },
  ];

  // Key metrics
  const metrics = [
    {
      label: "Total Reports",
      value: "626",
      change: "+12%",
      icon: Trash2,
      color: "from-blue-500 to-cyan-500",
      trend: "up",
    },
    {
      label: "Resolved",
      value: "342",
      change: "+8%",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      trend: "up",
    },
    {
      label: "In Progress",
      value: "128",
      change: "+15%",
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      trend: "up",
    },
    {
      label: "Active Users",
      value: "1,247",
      change: "+5%",
      icon: Users,
      color: "from-orange-500 to-yellow-500",
      trend: "up",
    },
  ];

  // Recent reports table data
  const recentReports = [
    {
      id: "REP-1847",
      location: "Kingston Central",
      type: "Uncollected Garbage",
      status: "resolved",
      submitted: "2 hours ago",
      officer: "John Smith",
    },
    {
      id: "REP-1846",
      location: "Spanish Town",
      type: "Illegal Dumping",
      status: "in_progress",
      submitted: "4 hours ago",
      officer: "Maria Garcia",
    },
    {
      id: "REP-1845",
      location: "Montego Bay",
      type: "Blocked Drainage",
      status: "pending",
      submitted: "1 day ago",
      officer: "Unassigned",
    },
    {
      id: "REP-1844",
      location: "Port Royal",
      type: "Uncollected Garbage",
      status: "resolved",
      submitted: "2 days ago",
      officer: "David Brown",
    },
    {
      id: "REP-1843",
      location: "May Pen",
      type: "Illegal Dumping",
      status: "in_progress",
      submitted: "2 days ago",
      officer: "Sarah Johnson",
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
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold ml-2">
                ADMIN
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center text-sm">
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-smooth">
                Dashboard
              </a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-smooth">
                Reports
              </a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-smooth">
                Officers
              </a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-smooth">
                Analytics
              </a>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-smooth"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {admin.avatar}
                  </div>
                  <ChevronDown size={18} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="bg-green-600 text-white p-3 border-b">
                      <p className="font-bold text-sm">{admin.name}</p>
                      <p className="text-xs opacity-90">{admin.email}</p>
                    </div>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      <Settings className="inline mr-2" size={16} />
                      Settings
                    </a>
                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm border-t">
                      <LogOut className="inline mr-2" size={16} />
                      Sign Out
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
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Dashboard
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Reports
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Officers
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Analytics
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
              Real-time waste management operations overview
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${metric.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-smooth`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        {metric.label}
                      </p>
                      <p className="text-3xl font-black mt-2">{metric.value}</p>
                      <p className="text-xs opacity-75 mt-1">{metric.change} vs last week</p>
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
            {/* Line Chart - Reports Over Time */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <LineChartIcon size={24} className="text-blue-600" />
                Reports Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Total Submitted"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Report Status Pie Chart */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-purple-600" />
                Report Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Problem Areas & Recent Reports */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Top Problem Areas */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={24} className="text-red-600" />
                Top Problem Areas
              </h2>
              <div className="space-y-4">
                {topAreas.map((area, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <p className="font-semibold text-gray-900">{area.area}</p>
                      <p className="font-black text-gray-700">{area.reports}</p>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(area.reports / 145) * 100}%`,
                          backgroundColor: area.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-6 text-center">
                Focus resources on high-incident areas
              </p>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Activity size={24} className="text-green-600" />
                System Statistics
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-700 font-semibold">Avg Resolution Time</span>
                  <span className="text-2xl font-black text-green-600">4.2 hrs</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-700 font-semibold">Overall Resolution Rate</span>
                  <span className="text-2xl font-black text-blue-600">54.6%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-700 font-semibold">Active Field Officers</span>
                  <span className="text-2xl font-black text-purple-600">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Citizen Satisfaction</span>
                  <span className="text-2xl font-black text-yellow-600">4.7/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-x-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Recent Reports</h2>

            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">
                    Report ID
                  </th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">
                    Officer
                  </th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50 transition-smooth">
                    <td className="py-4 px-4 font-semibold text-blue-600 text-sm">
                      {report.id}
                    </td>
                    <td className="py-4 px-4 text-gray-800 text-sm">{report.location}</td>
                    <td className="py-4 px-4 text-gray-800 text-sm">{report.type}</td>
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
                    <td className="py-4 px-4 text-gray-800 text-sm font-medium">
                      {report.officer}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{report.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="w-full mt-6 py-3 text-green-600 font-bold border-2 border-green-600 rounded-lg hover:bg-green-50 transition-smooth">
              View All Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}