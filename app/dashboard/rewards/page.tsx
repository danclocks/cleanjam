/**
 * ================================================================
 * FILE PATH: app/dashboard/rewards/page.tsx
 * CREATED: November 6, 2025
 * UPDATED: November 7, 2025
 * 
 * REWARDS DASHBOARD PAGE
 * Updated with:
 * - Fixed 1:1 points to JMD conversion
 * - Working redemption modal/form
 * - Transaction history endpoint integration
 * ================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Gift, TrendingUp, History, AlertCircle, Loader, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { createClient } from '@supabase/supabase-js';

interface UserRewards {
  user_id: number;
  email: string;
  full_name: string;
  current_points_balance: number;
  lifetime_points_earned: number;
  total_points_redeemed: number;
  pending_redemption_points: number;
  redeemable_jmd: number;
}

interface Transaction {
  transaction_id: number;
  points: number;
  type: string;
  description: string;
  related_report_id: number | null;
  date: string;
  time: string;
  status: string;
}

interface LatestActivity {
  transaction_type: string;
  points_amount: number;
  description: string;
  date: string;
}

export default function RewardsDashboard() {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [latestActivity, setLatestActivity] = useState<LatestActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authId, setAuthId] = useState<string | null>(null);

  // Redemption modal state
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redemptionAmount, setRedemptionAmount] = useState<number>(500);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Fetch user balance and transaction history
  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get auth session
        console.log('🔐 Getting auth session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          console.error('❌ No session found:', sessionError);
          setError('Authentication required. Please log in to view rewards.');
          setLoading(false);
          return;
        }

        const authIdVal = sessionData.session.user.id;
        setAuthId(authIdVal);
        console.log('✅ Auth ID obtained:', authIdVal);

        // Step 2: Fetch user balance
        console.log('📊 Fetching user balance...');
        const balanceRes = await fetch(
          `/api/rewards/user-balance?auth_id=${authIdVal}`,
          { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (!balanceRes.ok) {
          const errorData = await balanceRes.json();
          throw new Error(errorData.error || 'Failed to fetch balance');
        }

        const balanceData = await balanceRes.json();
        console.log('✅ Balance data received:', balanceData);

        if (!balanceData.success) {
          throw new Error(balanceData.error || 'Invalid response from balance API');
        }

        setUserRewards(balanceData.user_rewards);
        setLatestActivity(balanceData.latest_activity);

        // Step 3: Fetch transaction history
        console.log('📜 Fetching transaction history...');
        const historyRes = await fetch(
          `/api/rewards/transaction-history?auth_id=${authIdVal}&limit=15&offset=0`,
          { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (!historyRes.ok) {
          const errorData = await historyRes.json();
          console.warn('Warning: Could not fetch history:', errorData.error);
        } else {
          const historyData = await historyRes.json();
          console.log('✅ History data received:', historyData);

          if (historyData.success) {
            setTransactions(historyData.transactions);
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error fetching rewards data:', err);
        setError(err.message || 'Failed to load rewards data');
        setLoading(false);
      }
    };

    fetchRewardsData();
  }, []);

  // Handle redemption request
  const handleRedemption = async () => {
    try {
      setRedeeming(true);
      setRedemptionError(null);

      if (!authId) {
        throw new Error('Authentication required');
      }

      console.log('💳 Requesting redemption...');
      console.log(`   Amount: ${redemptionAmount} points`);

      const response = await fetch('/api/rewards/request-redemption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_id: authId,
          points_amount: redemptionAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to request redemption');
      }

      console.log('✅ Redemption request submitted:', data);
      setRedemptionSuccess(true);

      // Close modal and refresh after 2 seconds
      setTimeout(() => {
        setShowRedemptionModal(false);
        setRedemptionSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Redemption error:', err);
      setRedemptionError(err.message || 'Failed to process redemption');
      setRedeeming(false);
    }
  };

  // Prepare data for pie chart
  const pointsBreakdown = userRewards
    ? [
        {
          name: 'Available',
          value: userRewards.current_points_balance,
          color: '#10b981',
        },
        ...(userRewards.pending_redemption_points > 0
          ? [
              {
                name: 'Pending',
                value: userRewards.pending_redemption_points,
                color: '#f59e0b',
              },
            ]
          : []),
        ...(userRewards.total_points_redeemed > 0
          ? [
              {
                name: 'Redeemed',
                value: userRewards.total_points_redeemed,
                color: '#6b7280',
              },
            ]
          : []),
      ]
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-green-600 animate-spin" />
          <p className="text-gray-600 font-semibold">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">Unable to Load Rewards</h3>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No user rewards
  if (!userRewards) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-yellow-900">No Rewards Data</h3>
              <p className="text-yellow-700 mt-1">Please contact support if you see this message.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Navigation bar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Gift className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-green-600 hidden sm:inline">
                Rewards
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{userRewards.full_name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">
            Your <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Rewards</span>
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            {userRewards.current_points_balance} points = $
            {userRewards.redeemable_jmd.toLocaleString()} JMD
          </p>
        </div>

        {/* Fancy Gift Card */}
        <div className="mb-10">
          <div className="relative h-56 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl shadow-2xl overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>

            {/* Card content */}
            <div className="relative h-full p-8 flex flex-col justify-between text-white">
              {/* Top section */}
              <div>
                <p className="text-sm font-semibold opacity-90">AVAILABLE POINTS</p>
                <h3 className="text-5xl font-black mt-2">
                  {userRewards.current_points_balance.toLocaleString()}
                </h3>
              </div>

              {/* Bottom section */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-75">REDEEMABLE AMOUNT</p>
                  <p className="text-3xl font-black">
                    ${userRewards.redeemable_jmd.toLocaleString()} JMD
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setRedemptionAmount(500);
                    setShowRedemptionModal(true);
                  }}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg transform hover:scale-105"
                >
                  Redeem Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Lifetime Earned */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Lifetime Earned</h3>
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <p className="text-4xl font-black text-green-600">
              {userRewards.lifetime_points_earned.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">Total points earned</p>
          </div>

          {/* Total Redeemed */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Total Redeemed</h3>
              <Gift className="text-amber-600" size={24} />
            </div>
            <p className="text-4xl font-black text-amber-600">
              {userRewards.total_points_redeemed.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">Points converted to rewards</p>
          </div>

          {/* Pending Redemption */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pending</h3>
              <Loader className="text-blue-600" size={24} />
            </div>
            <p className="text-4xl font-black text-blue-600">
              {userRewards.pending_redemption_points.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">Awaiting approval</p>
          </div>
        </div>

        {/* Charts and History */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Points Breakdown Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Points Breakdown</h3>
            {pointsBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pointsBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pointsBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} points`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No points earned yet. Start reporting!
              </div>
            )}
          </div>

          {/* Latest Activity */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Latest Activity</h3>
            {latestActivity ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-900 capitalize">
                      {latestActivity.transaction_type.replace('_', ' ')}
                    </p>
                    <p className="text-2xl font-black text-green-600">
                      +{latestActivity.points_amount}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{latestActivity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(latestActivity.date).toLocaleDateString()}
                  </p>
                </div>

                <a
                  href="#transactions"
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 mt-6"
                >
                  <History size={20} />
                  View All Transactions
                </a>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                No transactions yet. Your first 50 points are coming!
              </div>
            )}
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6" id="transactions">
          <h3 className="text-2xl font-black text-gray-900 mb-6">Recent Transactions</h3>

          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {tx.date} {tx.time}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-xs capitalize">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-lg">
                        <span className={tx.points > 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Start earning points by reporting issues!
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-10 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="text-xl font-black text-blue-900 mb-4">💡 How It Works</h3>
          <div className="grid md:grid-cols-2 gap-4 text-blue-900">
            <div className="flex gap-3">
              <span className="bg-blue-200 text-blue-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </span>
              <div>
                <strong>Sign Up Bonus:</strong>
                <p className="text-sm">Get 50 points just for signing up!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-200 text-blue-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </span>
              <div>
                <strong>Report Issues:</strong>
                <p className="text-sm">Earn 25-100 points per report (based on priority)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-200 text-blue-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </span>
              <div>
                <strong>Redeem Rewards:</strong>
                <p className="text-sm">1 point = 1 JMD cash (minimum 500 points)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-200 text-blue-900 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </span>
              <div>
                <strong>Track Progress:</strong>
                <p className="text-sm">Watch your impact grow over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Modal */}
      {showRedemptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {!redemptionSuccess ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900">Redeem Points</h2>
                  <button
                    onClick={() => setShowRedemptionModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Error message */}
                {redemptionError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-700">{redemptionError}</p>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                  {/* Balance info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-2xl font-black text-green-600">
                      {userRewards.current_points_balance} points
                    </p>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Points to Redeem
                    </label>
                    <input
                      type="number"
                      value={redemptionAmount}
                      onChange={(e) => setRedemptionAmount(parseInt(e.target.value) || 0)}
                      min="500"
                      step="100"
                      max={userRewards.current_points_balance}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <p className="text-xs text-gray-600 mt-1">Minimum: 500 points</p>
                  </div>

                  {/* JMD equivalent */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">You'll receive</p>
                    <p className="text-3xl font-black text-blue-600">
                      ${redemptionAmount} JMD
                    </p>
                    <p className="text-xs text-gray-600 mt-1">1 point = 1 JMD</p>
                  </div>

                  {/* Quick select buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setRedemptionAmount(amount)}
                        disabled={amount > userRewards.current_points_balance}
                        className={`py-2 px-3 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          redemptionAmount === amount
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowRedemptionModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedemption}
                    disabled={redeeming || redemptionAmount < 500 || redemptionAmount > userRewards.current_points_balance}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {redeeming ? 'Processing...' : 'Redeem Now'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Success message */}
                <div className="text-center py-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-600 mb-1">Your redemption request has been submitted.</p>
                  <p className="text-sm text-gray-500">It will be reviewed by our team shortly.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}