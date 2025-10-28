/**
 * ================================================================
 * FILE PATH: app/dashboard/reports/page.tsx
 * 
 * PAGE ROUTE LINKS:
 * - GET  /dashboard/reports              → Display all reports
 * - GET  /dashboard/reports?status=X     → Display reports filtered by status
 * - POST /dashboard/reports/new          → Navigate to create new report
 * - GET  /dashboard/reports/[id]         → View individual report details
 * ================================================================
 *
 * Reports listing page – API-based (no client-side Supabase calls)
 * 
 * Features:
 * - Fetches from /api/reports/details endpoint (Supabase view)
 * - Joins: reports → users → locations
 * - Status filtering (all, pending, assigned, in_progress, completed, resolved)
 * - Google Maps integration for location viewing
 * - Fully responsive: mobile (320px+), tablet (768px+), desktop (1024px+)
 * - CleanJamaica brand colors (green/emerald)
 * - Comprehensive error logging for debugging
 * 
 * CleanJamaica Dashboard 2025
 */

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
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Ensure SSR freshness

interface ReportView {
  report_id: string;
  report_type: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  reporter_name: string;
  reporter_email: string;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  debug?: any;
}

/**
 * Fetches reports from /api/reports/details endpoint
 * @param filter - Status filter (all, pending, assigned, etc.)
 * @returns Array of ReportView objects or null if error
 */
async function getReports(filter?: string): Promise<ReportView[] | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      console.error("❌ [ReportsPage] NEXT_PUBLIC_BASE_URL not set");
      throw new Error("Missing NEXT_PUBLIC_BASE_URL environment variable");
    }

    const url = filter && filter !== "all"
      ? `${baseUrl}/api/details?status=${encodeURIComponent(filter)}`
      : `${baseUrl}/api/details`;

    console.log("📖 [ReportsPage] Fetching from:", url);

    const res = await fetch(url, { 
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("   ├─ Response status:", res.status);
    console.log("   ├─ Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error("   ├─ Response not OK");
      console.error("   ├─ Status:", res.status, res.statusText);
      console.error("   └─ Body:", errorText);

      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText) as ApiErrorResponse;
        console.error("   └─ Error message:", errorJson.message);
        if (errorJson.debug) {
          console.error("   └─ Debug info:", errorJson.debug);
        }
        throw new Error(`API Error: ${errorJson.message}`);
      } catch (parseErr) {
        throw new Error(`API Error ${res.status}: ${res.statusText}`);
      }
    }

    const responseText = await res.text();
    console.log("   ├─ Raw response:", responseText.substring(0, 500));

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("❌ Failed to parse response as JSON");
      console.error("   └─ Response:", responseText);
      throw new Error("Invalid JSON response from API");
    }

    console.log("   ├─ Parsed response:", data);

    // Handle different response formats
    let reports: ReportView[] = [];

    if (Array.isArray(data)) {
      // Direct array response
      reports = data;
      console.log("   └─ Response is array, got", reports.length, "items");
    } else if (data.data && Array.isArray(data.data)) {
      // Wrapped response {data: [...]}
      reports = data.data;
      console.log("   └─ Response is wrapped, got", reports.length, "items");
    } else if (data.success === false) {
      // Error response
      throw new Error(data.message || "API returned error");
    } else {
      console.error("❌ Unexpected response format:", data);
      throw new Error("Unexpected API response format");
    }

    // Validate data structure
    console.log("   └─ Validating report structure...");
    if (reports.length > 0) {
      const firstReport = reports[0];
      console.log("   ├─ First report keys:", Object.keys(firstReport));
      console.log("   ├─ First report sample:", {
        report_id: firstReport.report_id,
        description: firstReport.description?.substring(0, 50),
        latitude: firstReport.latitude,
        longitude: firstReport.longitude,
      });
    }

    console.log(`✅ [ReportsPage] Retrieved ${reports.length} reports`);
    return reports;
  } catch (error: any) {
    console.error("❌ [ReportsPage] Error fetching reports:", error.message);
    console.error("   └─ Full error:", error);
    return null;
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const filterStatus = searchParams?.status || "all";
  let reports: ReportView[] = [];
  let fetchError: string | null = null;
  let fetchErrorDetails: any = null;

  console.log("🔄 [ReportsPage] Rendering with filter:", filterStatus);

  try {
    const result = await getReports(filterStatus);
    if (result === null) {
      fetchError = "Failed to load reports from API";
      fetchErrorDetails = "Check browser console for detailed error";
    } else {
      reports = result;
    }
  } catch (error: any) {
    console.error("❌ [ReportsPage] Caught error:", error.message);
    fetchError = error.message || "Unknown error occurred while fetching reports";
    fetchErrorDetails = error;
  }

  const filteredCount = reports.length;
  const totalCount = reports.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 sm:py-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Header Title */}
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

          {/* New Report Button */}
          <Link
            href="/dashboard/reports/new"
            className="inline-flex items-center justify-center bg-white text-green-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold hover:bg-gray-100 transition duration-200 whitespace-nowrap"
          >
            <Plus size={18} className="mr-2 flex-shrink-0" />
            <span>New Report</span>
          </Link>
        </div>

        {/* Subtitle */}
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Filter Reports</h2>
          </div>

          {/* Filter Buttons - Responsive Grid */}
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
        {fetchError ? (
          // Error State with Detailed Messages
          <div className="space-y-4">
            {/* Main Error Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-red-200 p-8 sm:p-12 text-center">
              <AlertCircle size={40} className="sm:w-12 sm:h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-semibold text-base sm:text-lg">
                {fetchError}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Please check the troubleshooting steps below or try refreshing the page
              </p>
            </div>

            {/* Troubleshooting Card */}
            <div className="bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 p-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-3">Troubleshooting:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>✓ Check that API endpoint <code className="bg-blue-100 px-2 py-1 rounded">/api/reports/details</code> exists</li>
                    <li>✓ Verify Supabase view <code className="bg-blue-100 px-2 py-1 rounded">vw_user_report_detail</code> exists in your database</li>
                    <li>✓ Check environment variables: <code className="bg-blue-100 px-2 py-1 rounded">NEXT_PUBLIC_BASE_URL</code></li>
                    <li>✓ Open browser DevTools (F12) → Console tab for detailed error messages</li>
                    <li>✓ Refresh the page (Ctrl+Shift+R) to reload with latest code</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === "development" && fetchErrorDetails && (
              <div className="bg-gray-100 rounded-xl border border-gray-300 p-4">
                <h4 className="font-bold text-gray-900 mb-2">Debug Information:</h4>
                <pre className="text-xs text-gray-700 overflow-x-auto bg-gray-50 p-3 rounded">
                  {JSON.stringify(fetchErrorDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : filteredCount === 0 ? (
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
                {/* Report Card Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column - Report Info */}
                  <div className="space-y-3">
                    {/* Report Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
                      {report.description?.substring(0, 60) || report.report_type}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                      <span className="text-sm sm:text-base break-words">
                        {report.location_name}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="flex-shrink-0 text-green-600" />
                      <span className="text-sm sm:text-base">
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Reporter Info */}
                    <p className="text-xs sm:text-sm text-gray-500 break-words">
                      Submitted by <span className="font-medium">{report.reporter_name}</span>
                      {" "}
                      <span className="text-gray-400">({report.reporter_email})</span>
                    </p>
                  </div>

                  {/* Right Column - Status & Actions */}
                  <div className="flex flex-col justify-between md:text-right space-y-4">
                    {/* Status Badge */}
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

                    {/* Action Links */}
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
                      ) : (
                        <div className="inline-flex items-center px-3 sm:px-4 py-2 text-gray-400 font-bold rounded-lg text-sm">
                          <Map size={16} className="mr-2 flex-shrink-0" />
                          <span>No Map</span>
                        </div>
                      )}

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