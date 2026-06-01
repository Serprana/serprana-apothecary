'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-cream-100 border-b border-cream-300 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 relative flex-shrink-0">
              <img src="/images/logo-black.png" alt="Serprana Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold tracking-widest text-forest-600 uppercase">SERPRANA</div>
              <div className="font-sans text-xs tracking-wider text-terracotta-500 uppercase">Apothecary</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="font-sans text-sm tracking-wide text-forest-600 hover:text-teal-400 transition-colors">Browse Herbs</Link>
            <Link href="/browse#concerns" className="font-sans text-sm tracking-wide text-forest-600 hover:text-teal-400 transition-colors">By Concern</Link>
            <Link href="/recipes" className="font-sans text-sm tracking-wide text-forest-600 hover:text-teal-400 transition-colors">Recipes</Link>
            <Link href="/tea-builder" className="font-sans text-sm tracking-wide text-forest-600 hover:text-teal-400 transition-colors">Tea Builder</Link>
            <Link href="/bulk" className="font-sans text-sm tracking-wide text-forest-600 hover:text-teal-400 transition-colors">Buy Herbs</Link>

            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="font-sans text-sm tracking-wide text-teal-500 hover:text-teal-600 transition-colors">
                  👤 {session.user?.name?.split(' ')[0] || 'Account'}
                </Link>
              </div>
            ) : (
              <Link href="/login" className="font-sans text-xs tracking-wide px-4 py-2 border border-teal-400 text-teal-500 hover:bg-teal-400 hover:text-white transition-all duration-200 rounded-sm">
                Sign In
              </Link>
            )}

            <a href="mailto:serpranahealing@gmail.com"
              className="font-sans text-xs tracking-wide px-4 py-2 border border-terracotta-400 text-terracotta-500 hover:bg-terracotta-500 hover:text-white transition-all duration-200 rounded-sm">
              Ask a Question
            </a>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-forest-600" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t border-cream-300 mt-3 flex flex-col gap-3">
            <Link href="/browse" className="font-sans text-sm tracking-wide text-forest-600 py-1" onClick={() => setMenuOpen(false)}>Browse Herbs</Link>
            <Link href="/browse#concerns" className="font-sans text-sm tracking-wide text-forest-600 py-1" onClick={() => setMenuOpen(false)}>Browse by Concern</Link>
            <Link href="/recipes" className="font-sans text-sm tracking-wide text-forest-600 py-1" onClick={() => setMenuOpen(false)}>Recipes</Link>
            <Link href="/tea-builder" className="font-sans text-sm tracking-wide text-forest-600 py-1" onClick={() => setMenuOpen(false)}>Build a Custom Tea</Link>
            <Link href="/bulk" className="font-sans text-sm tracking-wide text-forest-600 py-1" onClick={() => setMenuOpen(false)}>Buy Single Herbs</Link>
            {session ? (
              <>
                <Link href="/account" className="font-sans text-sm text-teal-500 py-1" onClick={() => setMenuOpen(false)}>My Account</Link>
                <button onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false) }} className="font-sans text-sm text-red-400 py-1 text-left">Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="font-sans text-sm text-teal-500 py-1" onClick={() => setMenuOpen(false)}>Sign In / Create Account</Link>
            )}
            <a href="mailto:serpranahealing@gmail.com" className="font-sans text-sm text-terracotta-500 py-1" onClick={() => setMenuOpen(false)}>Have questions? Email us →</a>
          </nav>
        )}
      </div>
    </header>
  )
}
