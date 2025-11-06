/**
 * ================================================================
 * FILE PATH: app/dashboard/reports/page.tsx
 * 
 * FIXED: Query the view directly without nested relationships
 * ================================================================
 */

"use client";

import {
  Trash2,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  Plus,
  Eye,
  Map,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface ReportView {
  report_id: string;
  report_type: string;
  description: string;
  status: string;
  priority: string;
  user_created_at: string;
  resolved_at: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  reporter_name: string;
  reporter_email: string;
}

export default function ReportsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const filterStatus = searchParams?.status || "all";
  const [reports, setReports] = useState<ReportView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create Supabase client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("🔐 [ReportsPage] Getting authenticated user...");

        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("❌ Auth error:", authError?.message);
          throw new Error("Please log in to view reports");
        }

        console.log(`✅ Authenticated as: ${user.id}`);

        // Look up internal user_id
        console.log("📋 Looking up user profile...");
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("user_id")
          .eq("auth_id", user.id)
          .single();

        if (userError || !userRecord) {
          console.error("❌ User profile error:", userError?.message);
          throw new Error("Your user profile was not found");
        }

        const internalUserId = userRecord.user_id;
        console.log(`✅ Internal user_id: ${internalUserId}`);

        // ==================== FIXED: Query view directly ====================
        // Get all columns from the view without nested relationships
        console.log("📖 Fetching reports...");
        let query = supabase
          .from("vw_user_report_detail")
          .select("*")  // ← FIXED: Just get all columns from view
          .eq("user_id", internalUserId)
          .order("user_created_at", { ascending: false });

        // Apply status filter
        if (filterStatus && filterStatus !== "all") {
          query = query.eq("status", filterStatus);
          console.log("   Filter by status:", filterStatus);
        }

        // Execute query
        const { data, error: queryError } = await query;

        if (queryError) {
          console.error("❌ Query error:", queryError.message);
          throw new Error(`Failed to fetch reports: ${queryError.message}`);
        }

        console.log(`✅ Retrieved ${data?.length || 0} reports`);

        // ==================== FORMAT RESPONSE ====================
        // Map the view columns to our interface
        const formatted = (data || []).map((r: any) => ({
          report_id: r.report_id,
          report_type: r.report_type,
          description: r.description,
          status: r.status,
          priority: r.priority,
          user_created_at: r.user_created_at,
          resolved_at: r.resolved_at,
          reporter_name: r.full_name || "Unknown",
          reporter_email: r.email || "N/A",
          location_name: r.name || "Unknown",
          latitude: r.latitude || null,
          longitude: r.longitude || null,
        }));

        setReports(formatted);
      } catch (err: any) {
        console.error("❌ Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filterStatus]);

  const totalCount = reports.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 sm:py-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <Trash2 size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black truncate">
                My Reports
              </h1>
              <p className="text-green-100 text-xs sm:text-sm mt-1">
                Total Reports Logged:{" "}
                <span className="font-bold text-white">{totalCount}</span>
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/reports/new"
            className="inline-flex items-center justify-center bg-white text-green-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold hover:bg-gray-100 transition duration-200 whitespace-nowrap"
          >
            <Plus size={18} className="mr-2 flex-shrink-0" />
            <span>New Report</span>
          </Link>
        </div>

        <p className="text-green-100 text-xs sm:text-sm mt-4">
          Track all your garbage issue reports and view their locations.
        </p>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {/* ===== FILTER SECTION ===== */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Filter size={20} className="sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Filter Reports
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {["all", "pending", "assigned", "in_progress", "completed", "resolved"].map(
              (status) => (
                <Link
                  key={status}
                  href={`/dashboard/reports?status=${status}`}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-center text-sm sm:text-base transition duration-200 ${
                    filterStatus === status
                      ? "bg-green-600 text-white shadow-lg ring-2 ring-green-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </Link>
              )
            )}
          </div>
        </div>

        {/* ===== REPORTS LIST ===== */}
        {loading ? (
          // Loading State
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-200 p-8 sm:p-12 text-center">
            <Loader size={40} className="sm:w-12 sm:h-12 text-green-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-semibold text-base sm:text-lg">
              Loading your reports...
            </p>
          </div>
        ) : error ? (
          // Error State
          <div className="space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-red-200 p-8 sm:p-12 text-center">
              <AlertCircle size={40} className="sm:w-12 sm:h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-semibold text-base sm:text-lg">
                Failed to load reports
              </p>
              <p className="text-gray-700 text-sm mt-2 font-mono bg-gray-50 p-3 rounded border border-gray-200">
                {error}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 p-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-3">Troubleshooting:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>✓ Make sure you are logged in</li>
                    <li>✓ Check your user profile exists in the database</li>
                    <li>✓ Try refreshing the page</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : reports.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-200 p-8 sm:p-12 text-center">
            <Trash2 size={40} className="sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold text-base sm:text-lg">
              No reports found
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {filterStatus !== "all" ? "Try a different filter" : "Start by creating a new report"}
            </p>
          </div>
        ) : (
          // Reports Grid
          <div className="space-y-4 sm:space-y-6">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-green-400 transition duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
                      {report.description?.substring(0, 60) || report.report_type}
                    </h3>

                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                      <span className="text-sm sm:text-base break-words">
                        {report.location_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="flex-shrink-0 text-green-600" />
                      <span className="text-sm sm:text-base">
                        {new Date(report.user_created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 break-words">
                      Submitted by{" "}
                      <span className="font-medium">{report.reporter_name}</span>
                    </p>
                  </div>

                  <div className="flex flex-col justify-between md:text-right space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 md:text-right">
                        Status
                      </p>
                      <div className="flex justify-start md:justify-end">
                        <span
                          className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm ${
                            report.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : report.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : report.status === "assigned"
                              ? "bg-blue-100 text-blue-700"
                              : report.status === "in_progress"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {report.status.toUpperCase().replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                      {report.latitude && report.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-200 text-sm sm:text-base"
                        >
                          <Map size={16} className="mr-2 flex-shrink-0" />
                          <span>Map</span>
                        </a>
                      ) : null}

                      <Link
                        href={`/dashboard/reports/${report.report_id}`}
                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-green-600 font-bold hover:text-green-700 hover:bg-green-50 rounded-lg transition duration-200 text-sm sm:text-base"
                      >
                        <Eye size={16} className="mr-2 flex-shrink-0" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}