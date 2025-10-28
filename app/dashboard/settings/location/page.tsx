// filepath: app/dashboard/locations/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, AlertCircle, TrendingUp, Users, Trash2, ChevronRight, Loader } from 'lucide-react';

interface Location {
  id: string;
  parish: string;
  latitude: number;
  longitude: number;
  community?: string;
  report_count?: number;
  active_reports?: number;
  created_at?: string;
}

interface LocationStats {
  totalLocations: number;
  totalReports: number;
  activeReports: number;
  averageReportsPerLocation: number;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState<LocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📍 [Locations Page] Starting data fetch...');

        // Fetch user profile
        console.log('👤 Fetching user profile...');
        const profileRes = await fetch('/api/user/profile');
        if (!profileRes.ok) {
          console.warn('⚠️ Profile fetch failed:', profileRes.status);
        } else {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
          console.log('✅ User profile loaded:', profileData.full_name);
        }

        // Fetch locations
        console.log('🗺️ Fetching all locations...');
        const locationsRes = await fetch('/api/locations');
        if (!locationsRes.ok) {
          throw new Error(`Failed to fetch locations: ${locationsRes.status}`);
        }
        const locationsData = await locationsRes.json();
        console.log('✅ Locations fetched:', locationsData.length, 'parishes');
        setLocations(locationsData);

        // Calculate stats
        const totalReports = locationsData.reduce((sum: number, loc: Location) => sum + (loc.report_count || 0), 0);
        const activeReports = locationsData.reduce((sum: number, loc: Location) => sum + (loc.active_reports || 0), 0);
        const avgReports = locationsData.length > 0 ? Math.round(totalReports / locationsData.length * 10) / 10 : 0;

        setStats({
          totalLocations: locationsData.length,
          totalReports,
          activeReports,
          averageReportsPerLocation: avgReports,
        });
        console.log('📊 Stats calculated:', { totalReports, activeReports, avgReports });
      } catch (err) {
        console.error('❌ Error fetching locations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLocations = locations.filter(location =>
    location.parish.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.community?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('🔍 Filtered locations:', filteredLocations.length, 'matching search term:', searchTerm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
              <div className="text-right">
                <p className="text-gray-600 text-sm">Location: <span className="font-semibold text-green-700">{userProfile.parish || 'Not set'}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <MapPin className="w-10 h-10 text-green-600" />
            All Locations
          </h1>
          <p className="text-gray-600">Browse garbage collection zones across Jamaica</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Locations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLocations}</p>
                </div>
                <MapPin className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
                <Trash2 className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeReports}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Reports/Location</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageReportsPerLocation}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by parish or community..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none bg-white text-gray-900 placeholder:text-gray-400 transition"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading locations...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Locations</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Locations Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <Link key={location.id} href={`/dashboard/locations/${location.id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500 group h-full">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition">{location.parish}</h3>
                          {location.community && (
                            <p className="text-gray-600 text-sm mt-1">{location.community}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition translate-x-0 group-hover:translate-x-1" />
                      </div>

                      {/* Coordinates */}
                      <div className="mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="font-mono">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-gray-600 text-xs font-medium uppercase">Total Reports</p>
                          <p className="text-2xl font-bold text-gray-900">{location.report_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-medium uppercase">Active</p>
                          <p className="text-2xl font-bold text-red-600">{location.active_reports || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No locations found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}