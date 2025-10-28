// filepath: app/dashboard/locations/[id]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, AlertCircle, Clock, User, ChevronLeft, Loader, Trash2, CheckCircle, Eye } from 'lucide-react';

interface Location {
  id: string;
  parish: string;
  latitude: number;
  longitude: number;
  community?: string;
  created_at?: string;
}

interface Report {
  id: string;
  description: string;
  issue_type: string;
  priority: string;
  status: string;
  submitted_at: string;
  full_name: string;
  location_street?: string;
  location_community?: string;
  location_parish?: string;
  photo_count?: number;
  photo_urls?: string[];
}

interface LocationDetail extends Location {
  report_count?: number;
  active_reports?: number;
}

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;

  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }

        // Fetch location detail
        const locationRes = await fetch(`/api/locations/${locationId}`);
        if (!locationRes.ok) {
          throw new Error('Failed to fetch location details');
        }
        const locationData = await locationRes.json();
        console.log('Location fetched:', locationData);
        setLocation(locationData);

        // Fetch reports for this location (we'll need to create an endpoint or filter client-side)
        const reportsRes = await fetch('/api/reports');
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          // Filter reports by location
          const filteredReports = reportsData.filter(
            (report: Report) => report.location_parish?.toLowerCase() === locationData.parish?.toLowerCase()
          );
          console.log('Reports for location:', filteredReports);
          setReports(filteredReports);
        }
      } catch (err) {
        console.error('Error fetching location detail:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchData();
    }
  }, [locationId]);

  const filteredReports = reports.filter(report => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return report.status !== 'resolved';
    if (filterStatus === 'resolved') return report.status === 'resolved';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading location details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition text-gray-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Location</h3>
                <p className="text-red-700 text-sm">{error || 'Location not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition text-gray-700 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Locations
        </button>

        {/* User Profile Card */}
        {userProfile && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                {userProfile.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-semibold text-lg">{userProfile.full_name || 'User'}</h3>
                <p className="text-gray-600 text-sm">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Header Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-green-600">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">{location.parish}</h1>
            </div>
            {location.community && (
              <p className="text-gray-600 text-lg ml-11">{location.community}</p>
            )}
          </div>

          {/* Coordinates */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Latitude</p>
                <p className="font-mono text-lg font-semibold text-gray-900">{location.latitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Longitude</p>
                <p className="font-mono text-lg font-semibold text-gray-900">{location.longitude.toFixed(6)}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{location.report_count || 0}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm font-medium mb-1">Active Reports</p>
              <p className="text-3xl font-bold text-gray-900">{location.active_reports || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm font-medium mb-1">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {location.report_count && location.active_reports 
                  ? Math.round(((location.report_count - location.active_reports) / location.report_count) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports in {location.parish}</h2>

            {/* Filter Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                }`}
              >
                All ({reports.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                }`}
              >
                Active ({reports.filter(r => r.status !== 'resolved').length})
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'resolved'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                }`}
              >
                Resolved ({reports.filter(r => r.status === 'resolved').length})
              </button>
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <Link key={report.id} href={`/dashboard/reports/${report.id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500 group h-full">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition line-clamp-2">
                            {report.description || report.issue_type}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{report.issue_type}</p>
                        </div>
                      </div>

                      {/* Status & Priority */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                          {report.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority?.toUpperCase()} Priority
                        </span>
                      </div>

                      {/* Reporter Info */}
                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">{report.full_name}</span>
                        </div>
                        {report.location_street && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <span>{report.location_street}</span>
                          </div>
                        )}
                      </div>

                      {/* Photos */}
                      {report.photo_urls && report.photo_urls.length > 0 && (
                        <div className="mb-4">
                          <div className="flex gap-2 flex-wrap">
                            {report.photo_urls.slice(0, 3).map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Report photo ${idx + 1}`}
                                className="w-16 h-16 rounded object-cover border border-gray-200"
                              />
                            ))}
                            {report.photo_urls.length > 3 && (
                              <div className="w-16 h-16 rounded bg-gray-200 border border-gray-300 flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-700">+{report.photo_urls.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          {new Date(report.submitted_at).toLocaleDateString()}
                        </div>
                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center border-l-4 border-gray-300">
              <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">No reports found in {location.parish}</p>
              <p className="text-gray-500 text-sm mt-2">Great news! This area is clean and well-maintained.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}