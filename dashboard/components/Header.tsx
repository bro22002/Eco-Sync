'use client'

export default function Header() {
  return (
    <header className="border-b border-gray-700 bg-gray-900/95 backdrop-blur">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-eco-400 to-eco-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Eco-Sync</h1>
            <p className="text-xs text-gray-400">Sustainability Visualizer</p>
          </div>
        </div>

        {/* Status and Info */}
        <div className="flex items-center gap-6">
          <div className="text-right text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-eco-500 animate-pulse"></div>
              <span className="text-gray-300">Real-time Feed</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">MCP Server Connected</p>
          </div>
        </div>
      </div>
    </header>
  )
}
