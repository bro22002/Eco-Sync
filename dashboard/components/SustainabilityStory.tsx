'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ShippingRoute {
  id: string
  origin: string
  destination: string
  weight_kg: number
  transport_type: 'air' | 'sea' | 'land'
  totalEmissions: number
  distance: number
}

interface SustainabilityStoryProps {
  route: ShippingRoute | null
  isLoading: boolean
}

const storyVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
}

function getStoryContent(route: ShippingRoute) {
  const impactLevel = route.totalEmissions > 1000 ? 'high' : route.totalEmissions > 500 ? 'medium' : 'low'
  
  const stories: Record<string, { title: string; narrative: string; recommendation: string; icon: string }> = {
    air: {
      title: '✈️ High-Impact Airfreight Journey',
      narrative: `This shipment travels via air, covering ${route.distance.toLocaleString()} km at high speed. While fast, airfreight generates ${route.totalEmissions.toFixed(0)} kg of CO₂e due to its carbon-intensive nature (0.255 g CO₂e/kg/km).`,
      recommendation: 'Consider consolidating shipments or switching to sea transport for non-urgent deliveries to reduce emissions by up to 95%.',
      icon: '🌍',
    },
    sea: {
      title: '🚢 Ocean Voyage - Lower Impact',
      narrative: `This route utilizes maritime transport, the most sustainable option for long distances. Covering ${route.distance.toLocaleString()} km, it generates only ${route.totalEmissions.toFixed(0)} kg of CO₂e (0.0112 g CO₂e/kg/km) - the greenest choice for bulk shipping.`,
      recommendation: 'Excellent sustainability choice! Prioritize sea routes for non-perishable goods to maximize carbon savings.',
      icon: '💚',
    },
    land: {
      title: '🚛 Ground Transport - Balanced Impact',
      narrative: `This shipment travels overland for ${route.distance.toLocaleString()} km, generating ${route.totalEmissions.toFixed(0)} kg of CO₂e (0.0613 g CO₂e/kg/km). Land transport offers a middle ground between speed and sustainability.`,
      recommendation: 'Optimize routing and consider electric vehicles for regional deliveries to further reduce carbon footprint.',
      icon: '🌱',
    },
  }

  return stories[route.transport_type]
}

export default function SustainabilityStory({ route, isLoading }: SustainabilityStoryProps) {
  const [selectedRoute, setSelectedRoute] = useState<ShippingRoute | null>(route)

  // Update when route changes
  if (route && route.id !== selectedRoute?.id) {
    setSelectedRoute(route)
  }

  const story = selectedRoute ? getStoryContent(selectedRoute) : null

  return (
    <div className="w-full flex-1 overflow-y-auto pr-2 pb-6 min-h-0">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            variants={storyVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-center h-full"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-3 border-eco-400 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-400">Loading sustainability insights...</p>
            </div>
          </motion.div>
        ) : story && selectedRoute ? (
          <motion.div
            key={selectedRoute.id}
            variants={storyVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Header Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/[0.02] backdrop-blur-md rounded-2xl p-7 border border-white/10 shadow-xl relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-eco-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <motion.div variants={itemVariants} className="flex items-start justify-between mb-6 relative z-10">
                <div>
                  <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-eco-300 to-eco-500 drop-shadow-sm flex items-center gap-3">
                    <span className="text-3xl filter drop-shadow-md">{story.icon}</span>
                    {story.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-3 tracking-wide font-medium flex items-center gap-2">
                    <span className="text-white/80">{selectedRoute.origin}</span>
                    <span className="text-eco-500/50">→</span>
                    <span className="text-white/80">{selectedRoute.destination}</span>
                  </p>
                </div>
              </motion.div>

              {/* Route Details Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4 mt-6 relative z-10"
              >
                <motion.div variants={itemVariants} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                  <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Weight</p>
                  <p className="text-white font-semibold text-xl">{selectedRoute.weight_kg.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span></p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                  <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Distance</p>
                  <p className="text-white font-semibold text-xl">{selectedRoute.distance.toLocaleString()} <span className="text-sm font-normal text-gray-500">km</span></p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:shadow-[0_0_15px_rgba(76,175,80,0.1)] transition-shadow">
                  <p className="text-eco-500/80 text-xs font-bold tracking-wider uppercase mb-1">CO₂e Emissions</p>
                  <p className="text-eco-400 font-bold text-xl drop-shadow-[0_0_8px_rgba(76,175,80,0.5)]">{selectedRoute.totalEmissions.toFixed(0)} <span className="text-sm font-normal text-eco-500/70">kg</span></p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                  <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Transport</p>
                  <p className="text-white font-semibold text-xl capitalize">{selectedRoute.transport_type}</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Story Narrative */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/[0.02] rounded-2xl p-7 border border-white/5 shadow-lg"
            >
              <motion.p variants={itemVariants} className="text-gray-300 leading-relaxed text-[15px]">
                {story.narrative}
              </motion.p>
            </motion.div>

            {/* Recommendation Card */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-br from-eco-500/10 to-transparent rounded-2xl p-7 border border-eco-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-eco-500" />
              <motion.h3 variants={itemVariants} className="text-eco-400 font-bold mb-3 flex items-center gap-2 text-lg">
                <span className="text-xl">💡</span> Sustainability Recommendation
              </motion.h3>
              <motion.p variants={itemVariants} className="text-emerald-100/80 leading-relaxed text-[15px]">
                {story.recommendation}
              </motion.p>
            </motion.div>

            {/* Impact Meter */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/[0.02] rounded-2xl p-7 border border-white/5 shadow-lg"
            >
              <motion.div variants={itemVariants} className="flex justify-between items-end mb-5">
                <h3 className="text-white font-bold text-lg">
                  Carbon Impact Level
                </h3>
                <span className="text-eco-400 font-semibold text-sm bg-eco-500/10 px-3 py-1.5 rounded-full border border-eco-500/20">
                  {((selectedRoute.totalEmissions / selectedRoute.weight_kg / selectedRoute.distance) * 1000000).toFixed(2)} g CO₂e/kg/km
                </span>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-3">
                <motion.div
                  className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner"
                  initial={{ backgroundColor: 'rgb(0, 0, 0, 0.4)' }}
                >
                  <motion.div
                    className="h-full rounded-full relative"
                    initial={{ width: '0%', backgroundColor: 'rgb(34, 197, 94)' }}
                    animate={{ 
                      width: `${Math.min((selectedRoute.totalEmissions / 2000) * 100, 100)}%`,
                      backgroundColor: selectedRoute.totalEmissions > 1000 ? 'rgb(239, 68, 68)' : selectedRoute.totalEmissions > 500 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)',
                      boxShadow: selectedRoute.totalEmissions > 1000 
                        ? '0 0 15px rgba(239,68,68,0.6)' 
                        : selectedRoute.totalEmissions > 500 
                          ? '0 0 15px rgba(245,158,11,0.6)' 
                          : '0 0 15px rgba(34,197,94,0.6)'
                    }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  >
                    {/* Inner highlight for 3D effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-full" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            variants={storyVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-center h-full text-center"
          >
            <div>
              <p className="text-4xl mb-4">📦</p>
              <p className="text-gray-400">Select a shipping route to view its sustainability story</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}