import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-forest-600 text-cream-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="font-display text-2xl font-light tracking-widest uppercase text-cream-200 mb-1">
              Serprana
            </div>
            <div className="font-sans text-xs tracking-widest uppercase text-sage-300 mb-4">
              Apothecary
            </div>
            <p className="font-sans text-sm text-cream-300 leading-relaxed">
              Herbal Remedies • Custom Tea Blends
            </p>
            <p className="font-sans text-sm text-cream-400 mt-2">
              Playa Venao, Panama<br />
              Inside Casa Venao Café
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className="font-sans text-xs tracking-widest uppercase text-sage-300 mb-4">Explore</div>
            <nav className="flex flex-col gap-2">
              <Link href="/browse" className="font-sans text-sm text-cream-300 hover:text-cream-100 transition-colors">Browse All Herbs</Link>
              <Link href="/browse#concerns" className="font-sans text-sm text-cream-300 hover:text-cream-100 transition-colors">Browse by Concern</Link>
              <Link href="/recipes" className="font-sans text-sm text-cream-300 hover:text-cream-100 transition-colors">Herbal Recipes</Link>
              <Link href="/tea-builder" className="font-sans text-sm text-cream-300 hover:text-cream-100 transition-colors">Build a Custom Tea — $15</Link>
              <Link href="/bulk" className="font-sans text-sm text-cream-300 hover:text-cream-100 transition-colors">Buy Single Herbs</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <div className="font-sans text-xs tracking-widest uppercase text-sage-300 mb-4">Connect</div>
            <p className="font-sans text-sm text-cream-300 mb-3">
              Have questions about herbs or need guidance choosing?
            </p>
            <a
              href="mailto:serpranahealing@gmail.com"
              className="inline-block font-sans text-sm text-terracotta-300 hover:text-terracotta-200 transition-colors"
            >
              serpranahealing@gmail.com →
            </a>
            <div className="mt-6">
              <a
                href="https://serprana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs tracking-wide text-cream-400 hover:text-cream-200 transition-colors"
              >
                serprana.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-forest-500 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-sans text-xs text-cream-400">
            © {new Date().getFullYear()} Serprana Apothecary. All rights reserved.
          </p>
          <p className="font-sans text-xs text-cream-500 italic">
            SER — To Be &nbsp;|&nbsp; PRANA — Life-Giving Force
          </p>
        </div>
      </div>
    </footer>
  )
}
