'use client'

export default function Header() {
  return (
    <header className="border-b border-white/[0.08] bg-[#070B10]/60 backdrop-blur-2xl sticky top-0 z-50 overflow-hidden">
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-eco-500/30 to-transparent"></div>
      
      <div className="max-w-[1800px] mx-auto px-8 py-5 flex items-center justify-between relative">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 group cursor-default">
          <div className="relative">
            <div className="absolute inset-0 bg-eco-500/20 blur-xl rounded-full group-hover:bg-eco-500/40 transition-all duration-500"></div>
            <div className="w-10 h-10 bg-gradient-to-br from-eco-400 to-eco-600 rounded-xl flex items-center justify-center relative border border-white/10 shadow-lg shadow-eco-500/20 group-hover:scale-105 transition-transform duration-500">
              <svg className="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white/95 group-hover:text-white transition-colors">
              Eco<span className="text-eco-400">Sync</span>
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mt-0.5">
              Next-Gen Sustainability Engine
            </p>
          </div>
        </div>

        {/* Status and Info */}
        <div className="flex items-center gap-8">
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-eco-500/5 border border-eco-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-eco-500 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"></div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-eco-400/90">System Operational</span>
            </div>
            <p className="text-[10px] font-medium text-gray-500 mt-2 tracking-wide">
              Global Stream <span className="text-gray-400">•</span> v2.4.0
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
