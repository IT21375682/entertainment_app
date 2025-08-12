'use client';

import Link from 'next/link';


export default function Footer() {
  return (
     <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">StreamNews</h3>
              <p className="text-gray-400 text-sm">
                Your ultimate destination for entertainment news and streaming content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/movie-news" className="hover:text-white transition-colors">
                    Movie News
                  </Link>
                </li>
                <li>
                  <Link href="/sports-news" className="hover:text-white transition-colors">
                    Sports News
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/videos" className="hover:text-white transition-colors">
                    Videos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Streaming</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/watch" className="hover:text-white transition-colors">
                    Watch Now
                  </Link>
                </li>
                <li>
                  <Link href="/trending" className="hover:text-white transition-colors">
                    Trending
                  </Link>
                </li>
                <li>
                  <Link href="/new-releases" className="hover:text-white transition-colors">
                    New Releases
                  </Link>
                </li>
                <li>
                  <Link href="/top-rated" className="hover:text-white transition-colors">
                    Top Rated
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 StreamNews. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}
