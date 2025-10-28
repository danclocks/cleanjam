/**
 * ===================================
 * FILE PATH: app/dashboard/reports/new/page.tsx
 * ===================================
 * 
 * New report submission page allowing users to report garbage issues
 * with location, photos, type, and priority selection
 * MODIFIED: Now displays logged-in user profile at the top
 */

"use client";

import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  Upload,
  Trash2,
  Plus,
  CheckCircle,
  Loader,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

interface FormData {
  description: string;
  report_type: string;
  priority: string;
  street: string;
  community: string;
  parish: string;
  latitude: string;
  longitude: string;
}

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string | null;
}

const REPORT_TYPES = [
  "Uncollected Garbage",
  "Illegal Dumping",
  "Blocked Drain",
  "Overgrown Area",
  "Dead Animal",
  "Hazardous Waste",
  "Other",
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

const PARISHES = [
  "Kingston",
  "Saint Andrew",
  "Saint Thomas",
  "Saint Catherine",
  "Portland",
  "Saint Mary",
  "Saint Ann",
  "Trelawny",
  "Saint James",
  "Hanover",
  "Westmoreland",
  "Saint Elizabeth",
  "Manchester",
  "Clarendon",
];

export default function NewReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    description: "",
    report_type: "",
    priority: "medium",
    street: "",
    community: "",
    parish: "",
    latitude: "",
    longitude: "",
  });

  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ==================== FETCH USER PROFILE ====================

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = getStoredUser();

        if (!storedUser) {
          router.push("/login");
          return;
        }

        // Fetch user profile from database
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("user_id, full_name, email, username, avatar_url")
          .eq("auth_id", storedUser.id)
          .single();

        if (profileError || !profileData) {
          console.error("Failed to load user profile:", profileError);
          setError("Failed to load your profile. Please try again.");
          setLoadingUser(false);
          return;
        }

        setUserProfile(profileData as UserProfile);
        setLoadingUser(false);
      } catch (error: any) {
        console.error("Error fetching user profile:", error.message);
        setError("An error occurred loading your profile");
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // ==================== FORM HANDLERS ====================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingPhoto(true);
    try {
      for (let i = 0; i < Math.min(files.length, 5 - photos.length); i++) {
        const file = files[i];

        // Validate file
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("Image size must be less than 5MB");
          continue;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        const photoId = `${Date.now()}-${i}`;

        setPhotos((prev) => [
          ...prev,
          {
            file,
            preview,
            id: photoId,
          },
        ]);
      }
    } catch (err: any) {
      setError("Error processing photos: " + err.message);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // ==================== VALIDATION ====================

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      setError("Please describe the issue");
      return false;
    }

    if (!formData.report_type) {
      setError("Please select a report type");
      return false;
    }

    if (!formData.street.trim()) {
      setError("Please enter a street address");
      return false;
    }

    if (!formData.community.trim()) {
      setError("Please enter a community");
      return false;
    }

    if (!formData.parish) {
      setError("Please select a parish");
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please provide location coordinates");
      return false;
    }

    if (photos.length === 0) {
      setError("Please add at least one photo");
      return false;
    }

    return true;
  };

  // ==================== SUBMIT REPORT ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!userProfile) {
      setError("User profile not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload photos to Supabase storage
      const photoUrls: string[] = [];

      for (const photo of photos) {
        const fileName = `${Date.now()}-${photo.file.name}`;
        const filePath = `reports/${userProfile.user_id}/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("reports")
          .upload(filePath, photo.file);

        if (uploadError) {
          setError("Failed to upload photo: " + uploadError.message);
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: publicData } = supabase.storage
          .from("reports")
          .getPublicUrl(filePath);

        photoUrls.push(publicData.publicUrl);
      }

      // Create report in database
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert([
          {
            user_id: userProfile.user_id,
            description: formData.description,
            report_type: formData.report_type,
            priority: formData.priority,
            street: formData.street,
            community: formData.community,
            parish: formData.parish,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            location: `${formData.street}, ${formData.community}, ${formData.parish}`,
            photo_url: photoUrls[0] || null,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (reportError) {
        setError("Failed to create report: " + reportError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect after success
      setTimeout(() => {
        router.push(`/dashboard/reports/${reportData.report_id}`);
      }, 2000);
    } catch (error: any) {
      console.error("❌ Error submitting report:", error);
      setError(error.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // ==================== LOADING STATE ====================

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/reports"
            className="text-green-600 font-bold mb-4 flex items-center gap-2 hover:text-green-700"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Report a Garbage Issue
          </h1>
          <p className="text-gray-600">
            Help us keep Jamaica clean by reporting issues in your area
          </p>
        </div>

        {/* User Profile Card */}
        {userProfile && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                {userProfile.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm opacity-90">Report submitted by:</p>
                <p className="text-xl font-bold">{userProfile.full_name}</p>
                <p className="text-sm opacity-90">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-bold text-green-900">Success!</h3>
              <p className="text-green-700 mt-2">
                Your report has been submitted successfully. Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-bold text-red-900">Error</h3>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Issue Details */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Trash2 size={28} className="text-green-600" />
              Issue Details
            </h2>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Describe the Issue *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the garbage issue, size, condition, etc."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none text-black placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 10 characters, be specific and descriptive
              </p>
            </div>

            {/* Report Type */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Type of Issue *
              </label>
              <select
                name="report_type"
                value={formData.report_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none text-black"
              >
                <option value="" className="text-gray-400">Select a type...</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-3">
                {PRIORITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: level.value,
                      }))
                    }
                    className={`px-4 py-3 rounded-lg font-bold transition-all ${
                      formData.priority === level.value
                        ? `${level.color} ring-2 ring-offset-2 ring-${level.value}-600`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <MapPin size={28} className="text-green-600" />
              Location
            </h2>

            {/* Parish */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Parish *
              </label>
              <select
                name="parish"
                value={formData.parish}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none text-black"
              >
                <option value="" className="text-gray-400">Select a parish...</option>
                {PARISHES.map((parish) => (
                  <option key={parish} value={parish}>
                    {parish}
                  </option>
                ))}
              </select>
            </div>

            {/* Community */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Community *
              </label>
              <input
                type="text"
                name="community"
                value={formData.community}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Kingston, Montego Bay"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none text-black placeholder:text-gray-400"
              />
            </div>

            {/* Street */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Enter street name or location description"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none text-black placeholder:text-gray-400"
              />
            </div>

            {/* Coordinates */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Latitude *
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 18.0176"
                  step="0.00001"
                  min="-90"
                  max="90"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none text-black placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Longitude *
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="e.g., -76.8023"
                  step="0.00001"
                  min="-180"
                  max="180"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none text-black placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                💡 Tip: Use your phone's GPS coordinates or click on a location in Google Maps
                to get the exact latitude and longitude.
              </p>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Upload size={28} className="text-green-600" />
              Photos ({photos.length}/5)
            </h2>

            {/* Upload Area */}
            <div className="mb-6">
              <label className="block border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:bg-green-50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  disabled={uploadingPhoto || photos.length >= 5}
                  className="hidden"
                />
                <Upload className="mx-auto mb-3 text-green-600" size={32} />
                <p className="font-bold text-gray-900">
                  {uploadingPhoto ? "Uploading..." : "Click to upload or drag photos"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  PNG, JPG up to 5MB each • Max 5 photos
                </p>
              </label>
            </div>

            {/* Photos Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.preview}
                      alt="Report photo"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/dashboard/reports"
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-smooth text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}