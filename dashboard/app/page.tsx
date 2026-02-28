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
  const [error, setError] = useState<string | null>(null)
  const [previewScore, setPreviewScore] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'logs' | 'consultant'>('logs')

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

    // Set up polling interval
    const interval = setInterval(
      loadData,
      Number(process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL) || 5000
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-gray-800 border-r border-gray-700">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-400 mb-2">⚠️ Connection Error</p>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
              </div>
            )}
            {!error && (
              <CanvasVisualizer logs={logs} isLoading={isLoading} previewScore={previewScore} />
            )}
          </div>
        </div>

        {/* Sidebar - Toggle between Logs and Consultant */}
        <div className="w-[42rem] bg-gray-900 border-l border-gray-700 flex flex-col">
          {/* Tab Toggle */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'logs'
                  ? 'text-eco-400 border-b-2 border-eco-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              📦 Shipping Logs
            </button>
            <button
              onClick={() => setActiveTab('consultant')}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'consultant'
                  ? 'text-eco-400 border-b-2 border-eco-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              🤖 AI Consultant
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'logs' ? (
              <ShippingLogs logs={logs} isLoading={isLoading} />
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
