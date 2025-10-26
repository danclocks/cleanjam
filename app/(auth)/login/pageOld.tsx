"use client";

import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for responsive adjustments
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({
        email: "",
        password: "",
      });

      // Store token and redirect
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Main Container - Responsive Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-center">
        
        {/* Left Side - Branding (Hidden on Mobile) */}
        <div className="hidden lg:block">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Logo and Title */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                  <Leaf size={24} className="text-white sm:w-7 sm:h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  CleanJamaica
                </h1>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-semibold mb-3 sm:mb-4">
                Building a Cleaner Jamaica Together
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-md">
                Join thousands of Jamaicans making a difference. Track, report, and solve waste management issues in your community.
              </p>
            </div>

            {/* Benefits - Responsive Grid */}
            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: "🎯", text: "Real-time waste tracking" },
                { icon: "🏆", text: "Earn rewards for contributions" },
                { icon: "🤝", text: "Connect with your community" },
                { icon: "🌱", text: "Create lasting environmental impact" },
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{benefit.icon}</span>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full bg-white shadow-lg sm:shadow-xl lg:shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 mx-2 sm:mx-0">
          
          {success ? (
            <div className="text-center py-8 sm:py-12">
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Sign in to continue making an impact
                </p>
              </div>

              {/* Error Message - Responsive */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 animate-shake">
                  <div className="text-red-600 mt-0.5 flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-700 text-xs sm:text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400 flex-shrink-0" size={isMobile ? 18 : 20} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-green-500 focus:outline-none transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400 flex-shrink-0" size={isMobile ? 18 : 20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 sm:pl-12 pr-9 sm:pr-12 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-green-500 focus:outline-none transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-2.5 sm:top-3.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      {showPassword ? (
                        <EyeOff size={isMobile ? 18 : 20} />
                      ) : (
                        <Eye size={isMobile ? 18 : 20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end pt-1">
                  <a
                    href="#"
                    className="text-xs sm:text-sm text-green-600 font-semibold hover:text-green-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button - Touch-Friendly */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base active:scale-95 touch-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Signing in...</span>
                      <span className="sm:hidden">Signing in</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={isMobile ? 18 : 22} />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link - Responsive */}
              <div className="text-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Don't have an account?
                </p>
                <Link
                  href="/signup"
                  className="text-green-600 font-bold text-sm sm:text-base hover:text-green-700 transition-colors active:scale-95"
                >
                  Create Account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Brand Info (Shown only on small screens) */}
      <style jsx>{`
        @media (max-width: 1023px) {
          .hidden.lg\\:block {
            display: none;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}