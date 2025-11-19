import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-purple-500/20 bg-black/40 backdrop-blur-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-8 p-4 rounded-lg border border-purple-500/20 bg-purple-950/20">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            <span className="text-purple-400 font-semibold">Disclaimer:</span> This website is for informational purposes only. 
            The statistics and data presented are not financial, betting, or investment advice. 
            Always conduct your own research and gamble responsibly. Past performance does not guarantee future results.
          </p>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-center md:text-left">
          <div>
            <h3 className="text-sm font-semibold text-purple-300 mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-slate-400 hover:text-purple-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/upcoming" className="text-xs text-slate-400 hover:text-purple-400 transition-colors">
                  Upcoming Matches
                </Link>
              </li>
              <li>
                <Link href="/historical" className="text-xs text-slate-400 hover:text-purple-400 transition-colors">
                  Historical Data
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-purple-300 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-xs text-slate-400 hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-slate-400 hover:text-purple-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-purple-300 mb-3">About</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracking Dagestani fighters in the UFC. Data sourced from official UFC statistics and ESPN.
              Updated daily via automated data refresh.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-purple-500/10">
          <p className="text-xs text-slate-500 text-center mb-4">
            © {currentYear} Dagestani MMA Stats. All rights reserved.
          </p>
          
          {/* Powered by */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-500">powered by</span>
            <a 
              href="https://pointonefive.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/doginal_5098.png" 
                alt="Point OneFive" 
                className="h-5 w-5"
              />
              <span className="text-xs font-medium text-slate-300">point_onefive</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
