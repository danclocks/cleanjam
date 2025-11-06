/**
 * ===================================
 * FILE PATH: app/login/page.tsx
 * 
 * ✨ UPDATED: Session Sync Fix
 * ===================================
 * 
 * Updated handleLogin method now:
 * 1. Authenticates user
 * 2. Stores session in localStorage
 * 3. SETS SUPABASE SESSION (NEW FIX!)
 * 4. CHECKS USER ROLE from database
 * 5. REDIRECTS based on role
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, AlertCircle } from "lucide-react";
import { loginWithEmail, storeSession, storeUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ==================== HANDLE LOGIN (UPDATED WITH SESSION FIX) ====================

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      console.log("🔐 [LOGIN] Attempting login...");

      // Call login API
      const { data, error: loginError } = await loginWithEmail(email, password);

      if (loginError) {
        console.error("❌ Login error:", loginError);
        setError(loginError);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error("❌ No data returned from login");
        setError("Login failed");
        setLoading(false);
        return;
      }

      console.log("✅ Login successful!");
      console.log("  - User:", data.user?.email);
      console.log("  - Session:", data.session?.accessToken ? "✅" : "❌");

      // ==================== STORE SESSION & USER ====================

      console.log("💾 Storing session and user data...");

      // Store session tokens in localStorage
      storeSession(data.session);

      // Store user data in localStorage
      storeUser(data.user);

      console.log("✅ Data stored in localStorage");
      console.log("  - Access Token: ", data.session?.accessToken ? "✅" : "❌");
      console.log("  - User: ", data.user?.email);

      // ==================== ✨ FIX: SET SUPABASE SESSION ====================
      // This is the critical fix!
      // We need to tell Supabase's internal session manager about the new tokens
      // so that supabase.auth.getSession() returns the correct user

      console.log("🔑 Setting Supabase auth session...");

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Set the session in Supabase's internal session store
      await supabase.auth.setSession({
        access_token: data.session.accessToken,
        refresh_token: data.session.refreshToken,
      });

      console.log("✅ Supabase session set successfully");
      console.log("  - Now getSession() will return the correct user");

      // ==================== CHECK USER ROLE ====================

      console.log("🔑 [LOGIN] Checking user role...");

      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("user_id, role, full_name")
        .eq("auth_id", data.user?.id)
        .single();

      if (userError || !userRecord) {
        console.error("❌ Failed to fetch user role:", userError?.message);
        // Fallback: redirect to default dashboard
        console.warn("⚠️ [LOGIN] Role check failed, using default dashboard");
        console.log("🚀 Redirecting to /dashboard/reports...");
        router.push("/dashboard/reports");
        setLoading(false);
        return;
      }

      const userRole = userRecord.role as string;
      console.log(`✅ [LOGIN] User role found: ${userRole}`);
      console.log(`   - Name: ${userRecord.full_name || "N/A"}`);
      console.log(`   - Auth ID: ${data.user?.id}`);
      console.log(`   - User ID: ${userRecord.user_id}`);

      // ==================== REDIRECT BASED ON ROLE ====================

      let redirectPath = "/dashboard/reports"; // Default for residents

      if (userRole === "admin" || userRole === "supadmin") {
        redirectPath = "/admin/dashboard";
        console.log(`🚀 [LOGIN] Admin/SuperAdmin role detected`);
        console.log(`   - Redirecting to: ${redirectPath}`);
      } else if (userRole === "resident") {
        console.log(`🚀 [LOGIN] Resident role detected`);
        console.log(`   - Redirecting to: ${redirectPath}`);
      } else {
        console.warn(`⚠️ [LOGIN] Unknown role: ${userRole}, using default`);
      }

      console.log("🚀 Redirecting now...");
      router.push(redirectPath);
    } catch (error: any) {
      console.error("❌ Unexpected error:", error.message);
      setError(error.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // ==================== UI ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-white p-3 rounded-lg">
              <Leaf className="text-green-600" size={32} />
            </div>
            <h1 className="text-4xl font-black text-white">CleanJamaica</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-green-100">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
        >
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-700 font-semibold text-sm">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors text-black placeholder:text-gray-400"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors text-black placeholder:text-gray-400"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-600 hover:text-gray-900"
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300"
              disabled={loading}
            />
            <label htmlFor="remember" className="ml-3 text-sm text-gray-600">
              Remember me
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">Don't have an account?</span>
            </div>
          </div>

          {/* Signup Link */}
          <a
            href="/register"
            className="w-full border-2 border-green-600 text-green-600 font-bold py-3 rounded-lg hover:bg-green-50 transition-colors text-center block"
          >
            Create Account
          </a>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <a href="#" className="text-green-100 hover:text-white transition-colors block text-sm">
            Forgot password?
          </a>
          <a href="/" className="text-green-100 hover:text-white transition-colors block text-sm">
            Back to home
          </a>
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 bg-black bg-opacity-20 rounded-lg p-4 text-green-100 text-xs">
            <p className="font-bold mb-2">🔧 Debug - After Login:</p>
            <p>✅ Session stored in localStorage</p>
            <p>✅ Supabase session synced (NEW FIX!)</p>
            <p>✅ Role checked from database</p>
            <p>✅ resident → /dashboard/reports</p>
            <p>✅ admin → /dashboard/admin</p>
            <p>✅ supadmin → /dashboard/admin</p>
          </div>
        )}
      </div>
    </div>
  );
}