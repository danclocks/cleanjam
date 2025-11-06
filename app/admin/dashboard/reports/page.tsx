/**
 * ================================================================
 * FILE PATH: app/dashboard/admin/reports/page.tsx
 * 
 * ADMIN REPORTS PAGE - WITH LAYOUT
 * ================================================================
 */

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loader, AlertCircle, Eye, X, RefreshCw, Leaf, Menu, ChevronDown, Settings, LogOut } from 'lucide-react'

// ============================================
// TYPE DEFINITIONS
// ============================================

type Report = {
  report_id: number
  report_type: string
  description: string | null
  status: string
  priority: string
  photo_urls: string[] | null
  submitted_at: string
  resolved_at: string | null
  street: string | null
  community: string | null
  latitude: number | null
  longitude: number | null
  users: {
    user_id: number
    full_name: string | null
    email: string
    username: string | null
  } | null
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminReportsPage() {
  const router = useRouter()
  
  // STATE
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [adminName, setAdminName] = useState('Admin')
  const [adminEmail, setAdminEmail] = useState('')

  // ============================================
  // GET ADMIN INFO
  // ============================================

  useEffect(() => {
    const getAdminInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setAdminEmail(session.user.email)
          setAdminName(session.user.user_metadata?.full_name || 'Admin')
        }
      } catch (err) {
        console.error('Error getting admin info:', err)
      }
    }
    getAdminInfo()
  }, [])

  // ============================================
  // FETCH REPORTS
  // ============================================

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📡 Fetching reports...')

      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)

      const response = await fetch(`/api/admin/reports?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reports')
      }

      console.log(`✅ Fetched ${data.reports?.length || 0} reports`)
      setReports(data.reports || [])
      setTotalCount(data.totalCount || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Fetch error:', message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and filter changes
  useEffect(() => {
    fetchReports()
  }, [statusFilter, priorityFilter])

  // ============================================
  // UPDATE STATUS
  // ============================================

  const handleStatusChange = async (reportId: number, newStatus: string) => {
    try {
      setUpdatingId(reportId)
      console.log(`📝 Updating report ${reportId} to ${newStatus}`)

      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session) {
        alert('Not authenticated')
        setUpdatingId(null)
        return
      }

      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reportId, status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update')
      }

      console.log(`✅ Report updated`)

      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.report_id === reportId ? { ...r, status: newStatus } : r
        )
      )

      // Refresh data
      await fetchReports()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert(`Error: ${message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // ============================================
  // HANDLE SIGN OUT
  // ============================================

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Sign out error:', err)
      router.push('/')
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      assigned: 'bg-blue-100 text-blue-700 border border-blue-300',
      in_progress: 'bg-purple-100 text-purple-700 border border-purple-300',
      resolved: 'bg-green-100 text-green-700 border border-green-300',
      rejected: 'bg-red-100 text-red-700 border border-red-300',
      closed: 'bg-gray-100 text-gray-700 border border-gray-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 border border-gray-300'
  }

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700 border border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      high: 'bg-orange-100 text-orange-700 border border-orange-300',
      urgent: 'bg-red-100 text-red-700 border border-red-300',
    }
    return colors[priority] || 'bg-gray-100 text-gray-700 border border-gray-300'
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900 hidden sm:inline">
                CleanJamaica
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold ml-2">
                ADMIN
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center text-sm">
              <a
                href="/admin/dashboard"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Dashboard
              </a>
              <a
                href="admin/dashboard/reports"
                className="text-green-600 hover:text-green-700 font-bold"
              >
                Reports
              </a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium">
                Officers
              </a>
              <a href="#" className="text-gray-700 hover:text-green-600 font-medium">
                Users
              </a>
            </div>

            {/* Profile & Mobile Menu */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={18} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="bg-red-600 text-white p-3 border-b">
                      <p className="font-bold text-sm">{adminName}</p>
                      <p className="text-xs opacity-90">{adminEmail}</p>
                      <p className="text-xs mt-1 opacity-75">Role: ADMIN</p>
                    </div>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      <Settings className="inline mr-2" size={16} />
                      Settings
                    </a>
                    <a
                      href="/dashboard/reports"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm border-t"
                    >
                      Go to User Dashboard
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm border-t"
                    >
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
              <a href="/dashboard/admin" className="block py-2 text-gray-700 font-medium">
                Dashboard
              </a>
              <a href="/dashboard/admin/reports" className="block py-2 text-green-600 font-bold">
                Reports
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Officers
              </a>
              <a href="#" className="block py-2 text-gray-700 font-medium">
                Users
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-24 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900">All Reports</h1>
            <p className="text-gray-600 mt-2">
              Total Reports: <span className="font-bold text-green-600">{totalCount}</span>
            </p>
          </div>

          {/* FILTER SECTION */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-gray-900"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-gray-900"
                >
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={fetchReports}
                  className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Loading reports...</p>
            </div>
          )}

          {/* TABLE */}
          {!loading && reports.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-bold text-gray-900">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 font-bold text-gray-900">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-bold text-gray-900">
                        Reporter
                      </th>
                      <th className="text-left py-3 px-4 font-bold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-bold text-gray-900">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 font-bold text-gray-900">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-bold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.report_id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 font-semibold text-blue-600">
                          #{report.report_id}
                        </td>

                        <td className="py-3 px-4 text-gray-700">
                          <p className="font-medium">{report.street || 'N/A'}</p>
                          <p className="text-xs text-gray-500">
                            {report.community || 'N/A'}
                          </p>
                        </td>

                        <td className="py-3 px-4 text-gray-700">
                          <p className="font-medium text-sm">
                            {report.users?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {report.users?.email || 'N/A'}
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={report.status}
                            onChange={(e) =>
                              handleStatusChange(report.report_id, e.target.value)
                            }
                            disabled={updatingId === report.report_id}
                            className={`px-2 py-1 text-xs font-bold rounded cursor-pointer disabled:opacity-50 border-none ${getStatusColor(
                              report.status
                            )}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded ${getPriorityColor(
                              report.priority
                            )}`}
                          >
                            {report.priority?.toUpperCase() || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {formatDate(report.submitted_at)}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setSelectedReport(report)
                              setShowModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NO DATA */}
          {!loading && reports.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 font-semibold">No reports found</p>
            </div>
          )}

          {/* INFO */}
          {!loading && reports.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {reports.length} of {totalCount} reports
            </div>
          )}

          {/* MODAL - REPORT DETAILS */}
          {showModal && selectedReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
                {/* MODAL HEADER */}
                <div className="bg-green-600 text-white p-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Report #{selectedReport.report_id}
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      {selectedReport.report_type}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* MODAL BODY */}
                <div className="p-6 space-y-6">
                  {/* Location */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">📍 Location</h3>
                    <p className="text-gray-700">{selectedReport.street || 'N/A'}</p>
                    <p className="text-gray-600 text-sm">
                      {selectedReport.community || 'N/A'}
                    </p>
                    {selectedReport.latitude && selectedReport.longitude && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>

                  {/* Reporter */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">👤 Reporter</h3>
                    <p className="text-gray-700">
                      {selectedReport.users?.full_name || 'Unknown'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {selectedReport.users?.email || 'N/A'}
                    </p>
                  </div>

                  {/* Description */}
                  {selectedReport.description && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">📝 Description</h3>
                      <p className="text-gray-700">{selectedReport.description}</p>
                    </div>
                  )}

                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Status</h3>
                      <span
                        className={`px-3 py-1 text-sm font-bold rounded inline-block ${getStatusColor(
                          selectedReport.status
                        )}`}
                      >
                        {selectedReport.status?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Priority</h3>
                      <span
                        className={`px-3 py-1 text-sm font-bold rounded inline-block ${getPriorityColor(
                          selectedReport.priority
                        )}`}
                      >
                        {selectedReport.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Photos */}
                  {selectedReport.photo_urls &&
                    Array.isArray(selectedReport.photo_urls) &&
                    selectedReport.photo_urls.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          📸 Photos ({selectedReport.photo_urls.length})
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {selectedReport.photo_urls.map((url, idx) => (
                            <div key={idx} className="bg-gray-100 rounded overflow-hidden">
                              <img
                                src={url}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-24 object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2224%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%2224%22/%3E%3C/svg%3E'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div className="bg-gray-50 border-t p-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white font-semibold rounded hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}