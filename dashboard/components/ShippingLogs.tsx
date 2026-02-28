'use client'

import { useEffect, useState } from 'react'
import { fetchCarbonEmissions } from '@/lib/mcp-client'

interface ShippingLog {
  id: string
  origin: string
  destination: string
  weight_kg: number
  transport_type: 'air' | 'sea' | 'land'
  timestamp: string
  emissions?: number
}

interface ShippingLogsProps {
  logs: ShippingLog[]
  isLoading: boolean
  error: string | null
}

export default function ShippingLogs({ logs, isLoading, error }: ShippingLogsProps) {
  const [enrichedLogs, setEnrichedLogs] = useState<ShippingLog[]>([])
  const [emissions, setEmissions] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const loadEmissions = async () => {
      try {
        const result = await fetchCarbonEmissions()
        if (result && (result as any).results) {
          const emissionsMap: { [key: string]: number } = {}
          const resultsArray = (result as any).results as Array<any>
          resultsArray.forEach((item: any) => {
            emissionsMap[item.record_id] = item.total_emissions_kg_co2e
          })
          setEmissions(emissionsMap)
        }
      } catch (err) {
        console.error('Error fetching emissions:', err)
      }
    }

    if (logs.length > 0) {
      loadEmissions()
    }
  }, [logs])

  useEffect(() => {
    const enriched = logs.map((log) => ({
      ...log,
      emissions: emissions[log.id] || 0,
    }))
    setEnrichedLogs(enriched)
  }, [logs, emissions])

  const getTransportColor = (type: 'air' | 'sea' | 'land') => {
    switch (type) {
      case 'air':
        return 'text-red-400 bg-red-900/20'
      case 'land':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'sea':
        return 'text-blue-400 bg-blue-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getTotalEmissions = () => {
    return Object.values(emissions).reduce((sum, val) => sum + val, 0)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-2">Shipping Logs</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-400">Active Shipments</p>
            <p className="text-eco-400 font-bold text-lg">{logs.length}</p>
          </div>
          <div>
            <p className="text-gray-400">Total CO₂e</p>
            <p className="text-red-400 font-bold text-lg">{getTotalEmissions().toFixed(0)} kg</p>
          </div>
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-center text-red-400 text-sm">
            <p>⚠️ Failed to load logs</p>
            <p className="text-gray-400 mt-1 text-xs">{error}</p>
          </div>
        ) : isLoading && enrichedLogs.length === 0 ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-eco-400"></div>
            <p className="text-gray-400 text-sm mt-2">Loading logs...</p>
          </div>
        ) : enrichedLogs.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p className="text-sm">No shipping records available</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {enrichedLogs.map((log, index) => (
              <div
                key={log.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-eco-600 transition-colors animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getTransportColor(log.transport_type)}`}>
                        {log.transport_type.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs">{log.id}</span>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="text-xs mb-2">
                  <p className="text-gray-300 font-medium truncate">{log.origin}</p>
                  <div className="flex items-center justify-center my-1">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <svg className="w-4 h-4 mx-1 text-eco-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                  <p className="text-gray-300 font-medium truncate">{log.destination}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div className="bg-gray-700/50 rounded p-1.5">
                    <p className="text-gray-400">Weight</p>
                    <p className="text-white font-semibold">{log.weight_kg.toLocaleString()}</p>
                    <p className="text-gray-500">kg</p>
                  </div>
                  <div className="bg-gray-700/50 rounded p-1.5">
                    <p className="text-gray-400">CO₂e</p>
                    <p className="text-red-400 font-semibold">{(log.emissions || 0).toFixed(0)}</p>
                    <p className="text-gray-500">kg</p>
                  </div>
                  <div className="bg-gray-700/50 rounded p-1.5">
                    <p className="text-gray-400">Intensity</p>
                    <p className="text-blue-400 font-semibold">{((log.emissions || 0) / log.weight_kg).toFixed(2)}</p>
                    <p className="text-gray-500">kg/kg</p>
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-gray-500 text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {enrichedLogs.length > 0 && (
        <div className="p-3 border-t border-gray-700 text-xs text-gray-400 text-center">
          Showing {enrichedLogs.length} of {enrichedLogs.length} shipments
        </div>
      )}
    </div>
  )
}
