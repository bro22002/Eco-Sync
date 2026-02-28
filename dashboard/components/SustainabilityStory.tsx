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
              className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-eco-600/30"
            >
              <motion.div variants={itemVariants} className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-eco-400 flex items-center gap-2">
                    <span className="text-3xl">{story.icon}</span>
                    {story.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Route: {selectedRoute.origin} → {selectedRoute.destination}
                  </p>
                </div>
              </motion.div>

              {/* Route Details Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4 mt-4"
              >
                <motion.div variants={itemVariants} className="bg-black/40 rounded p-3">
                  <p className="text-gray-400 text-xs">Weight</p>
                  <p className="text-eco-400 font-semibold text-lg">{selectedRoute.weight_kg.toLocaleString()} kg</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-black/40 rounded p-3">
                  <p className="text-gray-400 text-xs">Distance</p>
                  <p className="text-eco-400 font-semibold text-lg">{selectedRoute.distance.toLocaleString()} km</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-black/40 rounded p-3">
                  <p className="text-gray-400 text-xs">CO₂e Emissions</p>
                  <p className="text-eco-400 font-semibold text-lg">{selectedRoute.totalEmissions.toFixed(0)} kg</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-black/40 rounded p-3">
                  <p className="text-gray-400 text-xs">Transport Type</p>
                  <p className="text-eco-400 font-semibold text-lg capitalize">{selectedRoute.transport_type}</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Story Narrative */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-800/50 rounded-lg p-6 border border-eco-500/20"
            >
              <motion.p variants={itemVariants} className="text-gray-300 leading-relaxed">
                {story.narrative}
              </motion.p>
            </motion.div>

            {/* Recommendation Card */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-eco-950/40 rounded-lg p-6 border-2 border-eco-500/40"
            >
              <motion.h3 variants={itemVariants} className="text-eco-400 font-semibold mb-3 flex items-center gap-2">
                <span>💡</span> Sustainability Recommendation
              </motion.h3>
              <motion.p variants={itemVariants} className="text-eco-300">
                {story.recommendation}
              </motion.p>
            </motion.div>

            {/* Impact Meter */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-800/50 rounded-lg p-6 border border-eco-600/30"
            >
              <motion.h3 variants={itemVariants} className="text-eco-400 font-semibold mb-4">
                Carbon Impact Level
              </motion.h3>
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Emissions Intensity</span>
                  <span className="text-eco-400 font-semibold">
                    {(selectedRoute.totalEmissions / selectedRoute.weight_kg / selectedRoute.distance * 1000000).toFixed(2)} g CO₂e/kg/km
                  </span>
                </div>
                <motion.div
                  className="w-full h-2 bg-gray-700 rounded-full overflow-hidden"
                  initial={{ backgroundColor: 'rgb(55, 65, 81)' }}
                  animate={{
                    backgroundColor: selectedRoute.totalEmissions > 1000 ? 'rgb(139, 69, 19)' : selectedRoute.totalEmissions > 500 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)',
                  }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-eco-500 to-eco-400"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min((selectedRoute.totalEmissions / 2000) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
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