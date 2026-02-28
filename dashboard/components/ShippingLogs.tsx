'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import SustainabilityStory from './SustainabilityStory'

interface ShippingLog {
  id: string
  origin: string
  destination: string
  weight_kg: number
  transport_type: 'air' | 'sea' | 'land'
  timestamp: string
  totalEmissions?: number
  distance?: number
}

interface ShippingLogsProps {
  logs: ShippingLog[]
  isLoading: boolean
}

// Distance lookup table (same as CanvasVisualizer)
const distances: Record<string, number> = {
  'Shanghai, China-Los Angeles, USA': 12000,
  'Tokyo, Japan-New York, USA': 10800,
  'Berlin, Germany-Paris, France': 880,
  'Singapore, Singapore-Dubai, UAE': 3600,
  'Mumbai, India-London, UK': 7200,
  'Mexico City, Mexico-Toronto, Canada': 2100,
  'Rotterdam, Netherlands-Hamburg, Germany': 450,
}

// Emission factors (EPA standards)
const emissionFactors: Record<string, number> = {
  air: 0.255,
  sea: 0.0112,
  land: 0.0613,
}

function calculateEmissions(log: ShippingLog): { distance: number; emissions: number } {
  const key = `${log.origin}-${log.destination}`
  const distance = distances[key] || 5000
  const factor = emissionFactors[log.transport_type]
  const emissions = (log.weight_kg * distance * factor) / 1000
  
  return { distance, emissions }
}

function enrichLogWithMetrics(log: ShippingLog): ShippingLog & { distance: number; totalEmissions: number } {
  const { distance, emissions } = calculateEmissions(log)
  return {
    ...log,
    distance,
    totalEmissions: emissions,
  }
}

export default function ShippingLogs({ logs, isLoading }: ShippingLogsProps) {
  const [selectedRoute, setSelectedRoute] = useState<(ShippingLog & { distance: number; totalEmissions: number }) | null>(null)

  const logItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: { x: 4 },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-6 overflow-hidden">
      {/* Sidebar - Shipping Logs */}
      <div className="lg:col-span-1 bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden flex flex-col min-h-0 h-full">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-eco-400">Active Shipments</h2>
          <p className="text-xs text-gray-400">{logs.length} routes</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {logs.map((log) => {
            const enriched = enrichLogWithMetrics(log)
            return (
              <motion.button
                key={log.id}
                variants={logItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onClick={() => setSelectedRoute(enriched)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedRoute?.id === log.id
                    ? 'bg-eco-600/30 border border-eco-500 shadow-lg shadow-eco-500/20'
                    : 'bg-gray-900/50 border border-gray-700/30 hover:bg-gray-900/70'
                }`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <span className="font-semibold text-sm text-gray-200 flex-1">
                    {log.origin} → {log.destination}
                  </span>
                  <span
                    className={`shrink-0 text-xs px-2 py-1 rounded-full font-semibold ${
                      log.transport_type === 'air'
                        ? 'bg-red-900/40 text-red-300'
                        : log.transport_type === 'sea'
                          ? 'bg-blue-900/40 text-blue-300'
                          : 'bg-yellow-900/40 text-yellow-300'
                    }`}
                  >
                    {log.transport_type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{log.weight_kg.toLocaleString()} kg</p>
                <p className="text-xs text-eco-400 mt-1">{enriched.totalEmissions.toFixed(0)} kg CO₂e</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Main Content - Sustainability Story */}
      <div className="lg:col-span-2 overflow-hidden flex flex-col min-h-0 h-full">
        <SustainabilityStory route={selectedRoute} isLoading={isLoading} />
      </div>
    </div>
  )
}
