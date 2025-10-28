"use client";
import Link from 'next/link'

import {
  Leaf,
  Trash2,
  Gift,
  MapPin,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gradient hidden sm:inline">
                CleanJamaica
              </span>
              <span className="text-lg font-bold text-gradient sm:hidden">
                CJ
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
              <a
                href="#how"
                className="text-gray-700 hover:text-green-600 font-medium transition-smooth"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-green-600 font-medium transition-smooth"
              >
                Features
              </a>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex gap-4">
              <Link 
                href="/login" 
                className="px-6 py-2 text-green-600 font-semibold hover:text-green-700 transition-smooth border-2 border-green-600 rounded-lg"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-smooth"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={24} className="text-green-600" />
              ) : (
                <Menu size={24} className="text-green-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t">
              <a
                href="#how"
                className="block py-2 text-gray-700 hover:text-green-600 font-medium transition-smooth"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="block py-2 text-gray-700 hover:text-green-600 font-medium transition-smooth"
              >
                Features
              </a>
              <div className="flex flex-col gap-2 mt-4">
                <Link 
                  href="/login"
                  className="px-6 py-2 text-green-600 font-semibold border-2 border-green-600 rounded-lg text-center"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - BOLD & BRIGHT */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full mb-6 font-bold text-sm shadow-lg">
            🇯🇲 Jamaica's #1 Waste Solution
          </div>

          {/* MEGA HEADING */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight animate-slide-up">
            Keep Jamaica{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent">
              Clean
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Report garbage. Track recycling. Earn rewards. Transform Jamaica together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-smooth flex items-center justify-center gap-2 text-lg shadow-lg"
            >
              Get Started Now <ArrowRight size={24} />
            </Link>
            <button className="px-10 py-4 bg-white text-green-600 font-bold border-2 border-green-600 rounded-xl hover:bg-green-50 transition-smooth text-lg">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 md:gap-12">
            <div>
              <p className="text-4xl md:text-5xl font-black text-green-600">
                20%
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Target reduction in year 1
              </p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-emerald-600">
                Real-Time
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Issue tracking & rewards
              </p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black text-blue-600">
                6
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Stakeholder groups
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple 3 Steps */}
      <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
            Simple. Effective. Rewarding.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Report an Issue",
                description: "See uncollected garbage or illegal dumping? Take a photo and report it with one tap.",
                icon: AlertCircle,
              },
              {
                step: "2",
                title: "We Take Action",
                description:
                  "NSWMA gets real-time notification. Field officers investigate and resolve the issue.",
                icon: CheckCircle,
              },
              {
                step: "3",
                title: "You Earn Rewards",
                description:
                  "Get points for every report. Convert them to cash, vouchers, or achievement badges.",
                icon: Gift,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-smooth"
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                  {item.step}
                </div>

                {/* Icon */}
                <item.icon className="text-green-600 mb-4 mt-4" size={40} />

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
            Built for Everyone
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "For Citizens",
                features: [
                  "📍 Report with GPS location & photos",
                  "🏆 Earn points for every action",
                  "💰 Convert points to real rewards",
                  "📱 Real-time status updates",
                ],
              },
              {
                title: "For NSWMA",
                features: [
                  "📊 Centralized issue tracking",
                  "🚀 Real-time data and analytics",
                  "👥 Better task management",
                  "📈 Measure impact (20% goal)",
                ],
              },
              {
                title: "For Field Officers",
                features: [
                  "📌 Clear GPS guided assignments",
                  "📸 Photo evidence reference",
                  "✅ Easy status updates",
                  "⏱️ Task prioritization",
                ],
              },
              {
                title: "For Partners",
                features: [
                  "♻️ Track recycling impact",
                  "👥 Connect with engaged citizens",
                  "📊 Participation metrics",
                  "🌍 Environmental contribution",
                ],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-2xl font-bold text-green-600 mb-6">
                  {feature.title}
                </h3>
                <ul className="space-y-4">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-800">
                      <span className="text-lg">{item.split(" ")[0]}</span>
                      <span className="font-medium">
                        {item.split(" ").slice(1).join(" ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Join thousands of Jamaicans keeping our island clean while earning rewards.
          </p>

          <div className="bg-white text-green-600 p-6 rounded-2xl mb-8 inline-block shadow-xl">
            <p className="text-sm font-bold mb-2">🎉 LAUNCH BONUS</p>
            <p className="text-3xl font-black">
              50 FREE Points on Sign Up!
            </p>
          </div>

          <Link 
            href="/register"
            className="px-12 py-4 bg-white text-green-600 font-black rounded-xl hover:bg-gray-100 transition-smooth flex items-center justify-center gap-2 text-lg mx-auto shadow-lg"
          >
            Start Earning Now <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="text-green-500" size={24} />
                <span className="font-bold text-white text-lg">CleanJamaica</span>
              </div>
              <p className="text-sm text-gray-400">
                Transforming Jamaica's waste management through citizen engagement.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-green-400 transition-smooth">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-smooth">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-smooth">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-green-400 transition-smooth">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-smooth">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-sm text-gray-400">
              &copy; 2025 CleanJamaica. Report. Track. Recycle. Reward.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}