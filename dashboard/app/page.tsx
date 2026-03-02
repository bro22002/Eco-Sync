'use client'

import { useEffect, useState } from 'react'
import CanvasVisualizer from '@/components/CanvasVisualizer'
import SustainabilityConsultant from '@/components/SustainabilityConsultant'
import ShippingLogs from '@/components/ShippingLogs'
import Header from '@/components/Header'
import { fetchSupplyChainData } from '@/lib/mcp-client'

interface ShippingLog {
  id: string
  origin: string
  destination: string
  weight_kg: number
  transport_type: 'air' | 'sea' | 'land'
  timestamp: string
  emissions?: number
}

export default function Dashboard() {
  const [logs, setLogs] = useState<ShippingLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'logs' | 'consultant'>('logs')
  const [previewScore, setPreviewScore] = useState<number | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<(ShippingLog & { distance: number; totalEmissions: number }) | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchSupplyChainData()

        if (data && data.records) {
          const mappedLogs: ShippingLog[] = data.records.map((record: any) => ({
            id: record.id,
            origin: record.origin,
            destination: record.destination,
            weight_kg: record.weight_kg,
            transport_type: record.transport_type,
            timestamp: record.timestamp,
          }))
          setLogs(mappedLogs)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        console.error('Error loading supply chain data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    const interval = setInterval(
      loadData,
      Number(process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL) || 5000
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#05080C] text-slate-200 selection:bg-eco-500/30 font-sans selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.05)_0%,transparent_50%)] pointer-events-none"></div>
      
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-81px)] relative overflow-hidden">
        {/* Canvas - Center / Top on Mobile */}
        <div className="w-full lg:flex-1 relative order-2 lg:order-1">
          <CanvasVisualizer
            logs={logs}
            isLoading={isLoading}
            previewScore={previewScore}
            selectedRoute={selectedRoute}
          />
        </div>

        {/* Sidebar - Left / Bottom on Mobile */}
        <div className="w-full lg:w-[46rem] bg-[#070B10]/40 backdrop-blur-3xl border-t lg:border-t-0 lg:border-l border-white/[0.05] flex flex-col z-20 shadow-[-40px_0_80px_-20px_rgba(0,0,0,0.8)] order-1 lg:order-2">
          {/* Dashboard Intelligence Toggle */}
          <div className="flex gap-4 px-8 pt-8 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 px-6 py-3.5 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 relative overflow-hidden group ${
                activeTab === 'logs'
                  ? 'text-eco-400 border border-eco-500/30 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.3)] bg-eco-500/5'
                  : 'text-gray-500 border border-white/[0.05] hover:bg-white/[0.05] hover:text-gray-300'
              }`}
            >
              <span className="relative z-10">Operations Center</span>
              {activeTab === 'logs' && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-eco-500 to-transparent"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('consultant')}
              className={`flex-1 px-6 py-3.5 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 relative overflow-hidden group ${
                activeTab === 'consultant'
                  ? 'text-blue-400 border border-blue-500/30 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] bg-blue-500/5'
                  : 'text-gray-500 border border-white/[0.05] hover:bg-white/[0.05] hover:text-gray-300'
              }`}
            >
              <span className="relative z-10">AI Strategy</span>
              {activeTab === 'consultant' && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              )}
            </button>
          </div>

          {/* Content area with smooth transition */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'logs' ? (
              <ShippingLogs
                logs={logs}
                isLoading={isLoading}
                onRouteSelect={setSelectedRoute}
              />
            ) : (
              <SustainabilityConsultant
                logs={logs}
                onPreviewScoreChange={setPreviewScore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
