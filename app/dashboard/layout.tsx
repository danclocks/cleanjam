'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => setIsMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== STICKY NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Section */}
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">CJ</span>
              </div>
              <span className="hidden sm:inline font-bold text-lg text-gray-900">
                CleanJamaica
              </span>
            </Link>

            {/* Desktop Navigation (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Reports', href: '/dashboard/reports' },
                { label: 'Schedule', href: '/dashboard/schedule' },
                { label: 'Rewards', href: '/dashboard/rewards' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Sign Out Button (Hidden on mobile) */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={24} className="text-gray-900" />
              ) : (
                <Menu size={24} className="text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu (Only visible when isMenuOpen is true) */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100">
              {/* Mobile Navigation Links */}
              <div className="space-y-1 py-2">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Reports', href: '/dashboard/reports' },
                  { label: 'Schedule', href: '/dashboard/schedule' },
                  { label: 'Rewards', href: '/dashboard/rewards' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Sign Out Button */}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 mt-2 text-left text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ===== MAIN CONTENT AREA ===== */}
      {/* This is where all your dashboard pages will appear */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}