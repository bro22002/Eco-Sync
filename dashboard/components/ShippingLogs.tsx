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
  distance_km?: number
}

interface ShippingLogsProps {
  logs: ShippingLog[]
  isLoading: boolean
  onRouteSelect?: (route: (ShippingLog & { distance: number; totalEmissions: number }) | null) => void
}

// Emission factors (EPA standards)
const emissionFactors: Record<string, number> = {
  air: 0.255,
  sea: 0.0112,
  land: 0.0613,
}

function calculateEmissions(log: ShippingLog): { distance: number; emissions: number } {
  // Use distance from OpenRoute API (distance_km field), fallback to 5000km
  const distance = log.distance_km || log.distance || 5000
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

export default function ShippingLogs({ logs, isLoading, onRouteSelect }: ShippingLogsProps) {
  const [selectedRoute, setSelectedRoute] = useState<(ShippingLog & { distance: number; totalEmissions: number }) | null>(null)

  const handleRouteSelect = (enriched: ShippingLog & { distance: number; totalEmissions: number }) => {
    setSelectedRoute(enriched)
    onRouteSelect?.(enriched)
  }

  const logItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as any }
    }),
    hover: { 
      x: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      transition: { duration: 0.2 }
    },
    selected: {
      x: 4,
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(20, 82, 49, 0.05) 100%)',
      borderColor: 'rgba(34, 197, 94, 0.4)',
      boxShadow: '0 0 25px -5px rgba(34, 197, 94, 0.2)',
    }
  }

  return (
    <div className={`grid grid-cols-1 ${selectedRoute ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-8 h-full p-3 lg:p-8 overflow-hidden bg-gradient-to-b from-[#0A0F17] to-[#070B10]`}>
      {/* Sidebar - Shipping Logs */}
      <div className={`${selectedRoute ? 'lg:col-span-2' : 'lg:col-span-1'} bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] border border-white/[0.05] overflow-hidden flex flex-col min-h-0 h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
        <div className="p-7 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent">
          <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-eco-300 via-eco-400 to-eco-500">
            Active Fleet
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex h-2 w-2 rounded-full bg-eco-500 animate-pulse"></span>
            <p className="text-[11px] text-gray-400 font-bold tracking-[0.1em] uppercase">
              {logs.length} Operations Live
            </p>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${!selectedRoute ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8' : 'space-y-4 p-6'} scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20`}>
          {logs.map((log, i) => {
            const enriched = enrichLogWithMetrics(log)
            const isSelected = selectedRoute?.id === log.id
            
            return (
              <motion.button
                key={log.id}
                custom={i}
                variants={logItemVariants}
                initial="hidden"
                animate={isSelected ? "selected" : "visible"}
                whileHover={isSelected ? "selected" : "hover"}
                onClick={() => handleRouteSelect(enriched)}
                className={`group w-full text-left p-5 rounded-2xl transition-all duration-500 relative overflow-hidden border ${
                  isSelected 
                    ? 'border-eco-500/40' 
                    : 'bg-white/[0.03] border-white/[0.05] hover:border-white/20'
                }`}
              >
                {/* Selection Glow Effect */}
                {isSelected && (
                  <div className="absolute inset-0 bg-eco-500/5 blur-2xl rounded-full"></div>
                )}
                
                {/* Active Indicator Line */}
                {isSelected && (
                  <motion.div 
                    layoutId="activeIndicator" 
                    className="absolute left-0 top-3 bottom-3 w-1.5 bg-gradient-to-b from-eco-300 to-eco-600 rounded-r-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                  />
                )}

                <div className="flex items-start justify-between mb-4 gap-4 relative z-10">
                  <div className="flex flex-col gap-2 flex-1 pl-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-0.5">Origin</span>
                      <span className="font-bold text-sm text-white/95 group-hover:text-white leading-tight">
                        {log.origin}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-eco-500/40 to-transparent"></div>
                      <span className="text-eco-400 text-[10px] font-black animate-pulse">DIRECT</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-eco-500/40 to-transparent"></div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-0.5">Destination</span>
                      <span className="font-bold text-sm text-white/95 group-hover:text-white leading-tight">
                        {log.destination}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`shrink-0 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border transition-all duration-500 ${
                        log.transport_type === 'air'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 group-hover:bg-red-500/20'
                          : log.transport_type === 'sea'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 group-hover:bg-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-500/20'
                      }`}
                    >
                      {log.transport_type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-end justify-between pl-2 mt-4 pt-4 border-t border-white/[0.05] relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-0.5">Payload</span>
                    <p className="text-xs text-white/80 font-bold tracking-wide">
                      {log.weight_kg.toLocaleString()} <span className="text-gray-500 font-medium">kg</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-0.5">Impact</span>
                    <p className="text-sm font-black text-eco-400 filter drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                      {enriched.totalEmissions.toFixed(0)} <span className="text-[10px] font-bold text-eco-500/60 uppercase ml-0.5">kg CO₂e</span>
                    </p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Main Content - Sustainability Story */}
      {selectedRoute && (
        <div className="lg:col-span-3 overflow-hidden flex flex-col min-h-0 h-full animate-slide-in">
          <SustainabilityStory route={selectedRoute} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}
