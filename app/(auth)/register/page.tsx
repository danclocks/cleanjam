"use client";

import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

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

    // ==================== CLIENT VALIDATION ====================

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError("Password must contain uppercase, lowercase, and numbers");
      setLoading(false);
      return;
    }

    try {
      // ==================== CALL REGISTER API ====================

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      // ==================== HANDLE ERRORS ====================

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        console.error("Registration error:", data);
        return;
      }

      // ==================== SUCCESS - SHOW EMAIL VERIFICATION ====================

      setSuccess(true);
      setUserEmail(formData.email);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      console.log("✅ Account created successfully:", data.user);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
      console.error("Signup error:", err);
    }
  };

  // ==================== RESEND EMAIL ====================

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage("✅ Verification email sent! Check your inbox.");
      } else {
        setResendMessage("❌ Failed to resend email. Please try again.");
      }
    } catch (err) {
      setResendMessage("❌ Error resending email. Please try again.");
      console.error("Resend error:", err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <Leaf className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold text-gradient">CleanJamaica</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Join the <span className="text-gradient">Movement</span>
            </h1>
            <p className="text-lg text-gray-600">
              Help keep Jamaica clean. Earn rewards. Make a difference.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {success ? (
              // ==================== EMAIL VERIFICATION STATE ====================
              <div className="text-center py-8 animate-fade-in">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="text-white" size={32} />
                </div>

                {/* Success Heading */}
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Confirm Your Email 📧
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-2 text-lg">
                  Account created successfully!
                </p>

                <p className="text-gray-500 mb-6 leading-relaxed">
                  We've sent a confirmation link to:
                </p>

                {/* Email Display */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-semibold text-lg">{userEmail}</p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle size={20} /> What to do next:
                  </h3>
                  <ol className="text-blue-800 space-y-2 text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Check your email inbox</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>Click the confirmation link</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Return here and sign in</span>
                    </li>
                  </ol>
                </div>

                {/* Check Spam Warning */}
                <p className="text-gray-500 text-sm mb-6">
                  💡 Check your spam folder if you don't see the email
                </p>

                {/* Resend Email Section */}
                <div className="border-t pt-6">
                  <p className="text-gray-600 mb-3">Didn't receive the email?</p>
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors mb-3"
                  >
                    {resendLoading ? "Sending..." : "Resend Verification Email"}
                  </button>

                  {resendMessage && (
                    <p className={`text-sm ${resendMessage.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                      {resendMessage}
                    </p>
                  )}
                </div>

                {/* Sign In Button */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-gray-600 text-sm mb-3">Already verified your email?</p>
                  <Link
                    href="/login"
                    className="w-full block bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-smooth"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              // ==================== SIGNUP FORM ====================
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-smooth font-medium"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-smooth font-medium"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-smooth font-medium"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      At least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-smooth font-medium"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl font-semibold text-sm flex items-start gap-3">
                      <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black py-4 rounded-xl hover:shadow-lg transition-smooth flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Get Started <ArrowRight size={22} />
                      </>
                    )}
                  </button>
                </form>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-6">
                  By signing up, you agree to our{" "}
                  <a href="#" className="text-green-600 font-semibold hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-600 font-semibold hover:underline">
                    Privacy Policy
                  </a>
                </p>

                {/* Sign In Link */}
                <div className="text-center mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 mb-2">Already have an account?</p>
                  <Link
                    href="/login"
                    className="text-green-600 font-bold hover:text-green-700 transition-smooth"
                  >
                    Sign In Here
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Features */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { emoji: "📝", text: "Easy Signup" },
              { emoji: "🎁", text: "Earn Rewards" },
              { emoji: "🌍", text: "Make Impact" },
            ].map((feature, index) => (
              <div key={index} className="bg-white bg-opacity-70 backdrop-blur rounded-2xl p-4">
                <p className="text-3xl mb-2">{feature.emoji}</p>
                <p className="text-sm font-bold text-gray-900">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}