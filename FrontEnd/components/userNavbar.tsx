'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Settings, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CustomerHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-red-500">
                StreamNews
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/movie-news" className="text-gray-300 hover:text-white transition-colors">
                  Movie News
                </Link>
                <Link href="/sports-news" className="text-gray-300 hover:text-white transition-colors">
                  Sports News
                </Link>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link href="/videos" className="text-gray-300 hover:text-white transition-colors">
                  Videos
                </Link>
                <Link href="/watch" className="text-gray-300 hover:text-white transition-colors">
                  Watch
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles, movies..."
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 w-64"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <X className="w-5 h-5 text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-300" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-black border-t border-gray-800 z-40 p-4 space-y-4">
          <Link href="/movie-news" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
            Movie News
          </Link>
          <Link href="/sports-news" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
            Sports News
          </Link>
          <Link href="/blog" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/videos" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
            Videos
          </Link>
          <Link href="/watch" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>
            Watch
          </Link>
        </div>
      )}
    </>
  );
}
