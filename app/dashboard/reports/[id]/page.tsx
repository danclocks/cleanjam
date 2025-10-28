/**
 * ===================================
 * FILE PATH: app/dashboard/reports/[id]/page.tsx
 * ===================================
 *
 * Description:
 * Displays a detailed view of an individual report using the API route (/api/reports/[id]).
 * Fetches data securely from Supabase via the API route instead of client-side queries.
 * Includes CleanJamaica green look & feel, loading and error states.
 * 
 * Updated to work with vw_user_report_detail view
 */

"use client";

import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  User,
  Mail,
  MapPinned,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";

interface Report {
  report_id: string;
  user_id: string;
  auth_id: string;
  report_type: string;
  description: string;
  status: string;
  priority: string;
  submitted_at: string;
  resolved_at: string | null;
  location_id: string;
  location_street: string;
  location_community: string;
  location_parish: string;
  report_latitude: number | null;
  report_longitude: number | null;
  location_latitude: number | null;
  location_longitude: number | null;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string | null;
  photo_urls: string[] | null;
  photo_filepaths: string[] | null;
  report_street: string;
  report_community: string;
}

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const reportId = id as string;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  // ==================== FETCH REPORT VIA API ROUTE ====================
  useEffect(() => {
    if (!reportId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = getStoredUser();
        if (!storedUser) {
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/reports/${reportId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.access_token}`,
          },
        });

        const { success, data, error: apiError } = await response.json();

        if (!success || !data) {
          setError(apiError || "Report not found");
          setLoading(false);
          return;
        }

        setReport(data);
        setLoading(false);
      } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchReport();
  }, [router, reportId]);

  // ==================== STATUS COLOR HELPERS ====================
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      assigned: "bg-blue-100 text-blue-700 border-blue-300",
      in_progress: "bg-purple-100 text-purple-700 border-purple-300",
      completed: "bg-green-100 text-green-700 border-green-300",
      resolved: "bg-emerald-100 text-emerald-700 border-emerald-300",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      urgent: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading report...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-bold text-red-900">Error</h3>
              <p className="text-red-700 mt-2">{error}</p>
              <Link
                href="/dashboard/reports"
                className="text-red-600 font-bold hover:underline mt-4 block"
              >
                Back to Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN CONTENT ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </Link>
          <h1 className="text-3xl font-black">Report Details</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Status Card */}
        <div className={`rounded-2xl shadow-md border-2 p-8 mb-8 ${getStatusColor(report.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-75 mb-2">Current Status</p>
              <p className="text-3xl font-black">
                {report.status?.replace("_", " ").toUpperCase()}
              </p>
            </div>
            <div className="text-6xl opacity-50">
              {report.status === "resolved" || report.status === "completed" ? (
                <CheckCircle size={64} />
              ) : (
                <Clock size={64} />
              )}
            </div>
          </div>
        </div>

        {/* Main Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            {/* Issue Description */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Issue Description</h2>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Type</p>
                  <p className="text-lg font-bold text-gray-900">
                    {report.report_type || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">
                    {report.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Location</p>
                  <div className="flex items-start gap-2 text-lg text-gray-900">
                    <MapPin size={20} className="mt-1 flex-shrink-0" />
                    <div>
                      <p>
                        {report.location_street || report.report_street || "N/A"}
                        {report.location_community && `, ${report.location_community}`}
                      </p>
                      <p className="text-sm text-gray-600 font-normal">
                        {report.location_parish && `Parish: ${report.location_parish}`}
                      </p>
                      {(report.report_latitude || report.report_longitude) && (
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {report.report_latitude?.toFixed(4)}, {report.report_longitude?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Section */}
            {report.photo_urls && report.photo_urls.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <ImageIcon size={28} />
                  Photo Evidence
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {report.photo_urls.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Report evidence ${idx + 1}`}
                      className="w-full rounded-lg object-cover max-h-96"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 p-8 mb-8 text-center">
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No photos attached</p>
              </div>
            )}

            {/* Resolution Status */}
            {report.resolved_at && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle size={28} className="text-green-600" />
                  Resolution Details
                </h2>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 font-semibold mb-1">Resolved On</p>
                  <p className="text-gray-900 font-bold">
                    {new Date(report.resolved_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Quick Info</h2>

              <div className="space-y-6">
                {/* Priority */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Priority</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${getPriorityColor(
                      report.priority
                    )}`}
                  >
                    {report.priority?.toUpperCase() || "NORMAL"}
                  </span>
                </div>

                {/* Report ID */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Report ID</p>
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {report.report_id}
                  </p>
                </div>

                {/* Submitted */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Submitted</p>
                  <p className="text-sm text-gray-700">
                    {new Date(report.submitted_at).toLocaleString()}
                  </p>
                </div>

                {/* Days Pending */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Days Pending</p>
                  <p className="text-sm font-bold text-gray-900">
                    {Math.floor(
                      (new Date().getTime() - new Date(report.submitted_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                </div>

                {/* Reporter Info */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                    <User size={16} />
                    Reporter
                  </h3>
                  <div className="space-y-3">
                    {report.avatar_url && (
                      <img
                        src={report.avatar_url}
                        alt={report.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Name</p>
                      <p className="text-sm font-bold text-gray-900">{report.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                        <Mail size={12} /> Email
                      </p>
                      <a
                        href={`mailto:${report.email}`}
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {report.email}
                      </a>
                    </div>
                    {report.username && (
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">Username</p>
                        <p className="text-sm text-gray-700">@{report.username}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}