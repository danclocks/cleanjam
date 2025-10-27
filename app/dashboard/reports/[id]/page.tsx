/**
 * ===================================
 * FILE PATH: app/dashboard/reports/[id]/page.tsx
 * ===================================
 * 
 * Individual report detail page showing complete report information
 * with status history and resolution notes
 */

"use client";

import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

interface Report {
  report_id: string;
  user_id: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  report_type: string;
  photo_url: string | null;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function ReportDetailPage({ params }: PageProps) {
  const router = useRouter();
  const reportId = params.id;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  // ==================== FETCH REPORT ====================

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = getStoredUser();

        if (!storedUser) {
          router.push("/login");
          return;
        }

        // Fetch report by ID
        const { data: reportData, error: reportError } = await supabase
          .from("reports")
          .select("*")
          .eq("report_id", reportId)
          .single();

        if (reportError || !reportData) {
          setError("Report not found");
          setLoading(false);
          return;
        }

        // Verify user owns this report
        const { data: userProfile } = await supabase
          .from("users")
          .select("user_id")
          .eq("auth_id", storedUser.id)
          .single();

        if (userProfile?.user_id !== reportData.user_id) {
          setError("You don't have permission to view this report");
          setLoading(false);
          return;
        }

        setReport(reportData as Report);
        setLoading(false);
      } catch (error: any) {
        console.error("❌ Unexpected error:", error.message);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchReport();
  }, [router, reportId]);

  // ==================== HELPER FUNCTIONS ====================

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
          {/* Left Column - Main Info */}
          <div className="md:col-span-2">
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
                  <div className="flex items-center gap-2 text-lg text-gray-900">
                    <MapPin size={20} />
                    {report.location}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Section */}
            {report.photo_url ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <ImageIcon size={28} />
                  Photo Evidence
                </h2>
                <img
                  src={report.photo_url}
                  alt="Report evidence"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 p-8 mb-8 text-center">
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No photo attached</p>
              </div>
            )}

            {/* Resolution Notes */}
            {report.resolved_at && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle size={28} className="text-green-600" />
                  Resolution Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      Resolved Date
                    </p>
                    <p className="text-lg text-gray-900">
                      {new Date(report.resolved_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {report.resolution_notes && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        Resolution Notes
                      </p>
                      <p className="text-gray-700 leading-relaxed p-4 bg-green-50 rounded-lg border border-green-200">
                        {report.resolution_notes}
                      </p>
                    </div>
                  )}
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

                {/* Created Date */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Submitted</p>
                  <p className="text-sm text-gray-700">
                    {new Date(report.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Days Pending */}
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Days Pending</p>
                  <p className="text-sm font-bold text-gray-900">
                    {Math.floor(
                      (new Date().getTime() - new Date(report.created_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
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