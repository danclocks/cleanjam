/**
 * ================================================================
 * FILE PATH: app/admin/redemptions/page.tsx
 * CREATED: November 6, 2025
 * 
 * ADMIN REDEMPTIONS MANAGEMENT PAGE
 * Admins review and approve/reject pending redemption requests.
 * ================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, XCircle, Loader, AlertCircle, Clock } from 'lucide-react';

interface Redemption {
  transaction_id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  user_community: string;
  points_amount: number;
  jmd_amount: number;
  description: string;
  status: string;
  requested_date: string;
  requested_time: string;
  timestamp: string;
}

export default function AdminRedemptionsPage() {
  const [adminAuthId, setAdminAuthId] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [processedIds, setProcessedIds] = useState<Set<number>>(new Set());
  const [processingId, setProcessingId] = useState<number | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Get admin auth ID from session
  useEffect(() => {
    const getAdminAuthId = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          setAdminAuthId(sessionData.session.user.id);
        } else {
          setError('No admin session found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting session:', err);
        setError('Failed to get admin session');
        setLoading(false);
      }
    };

    getAdminAuthId();
  }, []);

  // Fetch redemptions when admin ID or status filter changes
  useEffect(() => {
    if (!adminAuthId) return;

    const fetchRedemptions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📋 Fetching ${statusFilter} redemptions...`);

        const response = await fetch(
          `/api/admin/redemptions/pending?admin_auth_id=${adminAuthId}&status=${statusFilter}&limit=100`,
          { method: 'GET' }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch redemptions');
        }

        const data = await response.json();
        console.log(`✅ Fetched ${data.redemptions.length} ${statusFilter} redemptions`);

        setRedemptions(data.redemptions || []);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error fetching redemptions:', err);
        setError(err.message || 'Failed to fetch redemptions');
        setLoading(false);
      }
    };

    fetchRedemptions();
  }, [adminAuthId, statusFilter]);

  // Handle approve/reject action
  const handleRedemptionAction = async (transactionId: number, action: 'approve' | 'reject') => {
    try {
      if (!adminAuthId) return;

      setProcessingId(transactionId);
      console.log(`📤 ${action === 'approve' ? '✅ Approving' : '❌ Rejecting'} transaction ${transactionId}...`);

      const response = await fetch('/api/admin/redemptions/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_auth_id: adminAuthId,
          transaction_id: transactionId,
          action: action,
          notes: `${action === 'approve' ? 'Approved' : 'Rejected'} by admin`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} redemption`);
      }

      const data = await response.json();
      console.log(`✅ ${action === 'approve' ? 'Approved' : 'Rejected'}:`, data);

      // Mark as processed
      setProcessedIds((prev) => new Set([...prev, transactionId]));

      // Remove from list after a short delay
      setTimeout(() => {
        setRedemptions((prev) => prev.filter((r) => r.transaction_id !== transactionId));
      }, 500);

      setProcessingId(null);
    } catch (err: any) {
      console.error('❌ Error processing redemption:', err);
      alert(`Error: ${err.message}`);
      setProcessingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-semibold">Loading redemptions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No admin auth
  if (!adminAuthId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-yellow-900">Admin authentication required</h3>
            <p className="text-yellow-700 mt-1">Please log in as an admin to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Redemptions</h1>
            <div className="text-sm text-gray-600">Admin Panel</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">
            Redemption <span className="text-gradient">Requests</span>
          </h2>
          <p className="text-lg text-gray-600 mt-2">Review and approve/reject pending redemption requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(['pending', 'completed', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-3 font-bold border-b-2 transition ${
                statusFilter === status
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Redemptions Table */}
        {redemptions.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-bold text-gray-900">User</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-900">Email</th>
                    <th className="text-right py-4 px-6 font-bold text-gray-900">Points</th>
                    <th className="text-right py-4 px-6 font-bold text-gray-900">JMD</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-900">Requested</th>
                    <th className="text-center py-4 px-6 font-bold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((redemption, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                        processedIds.has(redemption.transaction_id) ? 'opacity-50' : ''
                      }`}
                    >
                      {/* User Name */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-900">{redemption.user_name}</p>
                          <p className="text-sm text-gray-500">{redemption.user_community}</p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6">
                        <p className="text-gray-700">{redemption.user_email}</p>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-6 text-right">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                          {redemption.points_amount.toLocaleString()}
                        </span>
                      </td>

                      {/* JMD Amount */}
                      <td className="py-4 px-6 text-right">
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                          ${redemption.jmd_amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Requested Date */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <div className="flex flex-col text-sm">
                            <p className="font-semibold text-gray-900">{redemption.requested_date}</p>
                            <p className="text-gray-500">{redemption.requested_time}</p>
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {statusFilter === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleRedemptionAction(redemption.transaction_id, 'approve')}
                                disabled={processingId === redemption.transaction_id}
                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                {processingId === redemption.transaction_id ? (
                                  <Loader size={18} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => handleRedemptionAction(redemption.transaction_id, 'reject')}
                                disabled={processingId === redemption.transaction_id}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                {processingId === redemption.transaction_id ? (
                                  <Loader size={18} className="animate-spin" />
                                ) : (
                                  <XCircle size={18} />
                                )}
                              </button>
                            </>
                          ) : (
                            <span className={`text-sm font-bold ${statusFilter === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                              {statusFilter === 'completed' ? '✅ Approved' : '❌ Rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">
              No {statusFilter} redemption requests
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Status</h3>
              <Clock className="text-yellow-600" size={24} />
            </div>
            <p className="text-4xl font-black text-yellow-600">Pending</p>
            <p className="text-sm text-gray-600 mt-2">Awaiting approval</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Approved</h3>
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <p className="text-4xl font-black text-green-600">Completed</p>
            <p className="text-sm text-gray-600 mt-2">Processed successfully</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Rejected</h3>
              <XCircle className="text-red-600" size={24} />
            </div>
            <p className="text-4xl font-black text-red-600">Failed</p>
            <p className="text-sm text-gray-600 mt-2">Points returned</p>
          </div>
        </div>
      </div>
    </div>
  );
}