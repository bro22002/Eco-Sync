'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

interface CanvasVisualizerProps {
  logs: Array<{
    id: string
    origin: string
    destination: string
    weight_kg: number
    transport_type: 'air' | 'sea' | 'land'
    timestamp: string
    distance_km?: number
  }>
  isLoading: boolean
  previewScore?: number | null
  selectedRoute?: {
    id: string
    origin: string
    destination: string
    weight_kg: number
    transport_type: 'air' | 'sea' | 'land'
    distance: number
    totalEmissions: number
  } | null
}

const P5TreeWrapper = dynamic(() => import('@/components/P5TreeWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-eco-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading visualization...</p>
      </div>
    </div>
  ),
})

interface TreeData {
  transportType: 'air' | 'sea' | 'land'
  carbonScore: number
  position: { x: number; y: number }
  totalEmissions: number
}

const emissionFactors = {
  air: 0.255,
  sea: 0.0112,
  land: 0.0613,
}

export default function CanvasVisualizer({
  logs,
  isLoading,
  previewScore,
  selectedRoute,
}: CanvasVisualizerProps) {
  const [trees, setTrees] = useState<TreeData[]>([])
  const [overallCarbonScore, setOverallCarbonScore] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)
  const [selectedTreeData, setSelectedTreeData] = useState<TreeData | null>(null)
  const [showLegendMobile, setShowLegendMobile] = useState(false)
  const [showInfoMobile, setShowInfoMobile] = useState(false)
  const [showStatsMobile, setShowStatsMobile] = useState(false)
  const [showFooterMobile, setShowFooterMobile] = useState(false)

  // Calculate trees from supply chain data
  useEffect(() => {
    if (!logs || logs.length === 0) {
      setTrees([])
      setOverallCarbonScore(0)
      return
    }

    // Group logs by transport type and calculate emissions
    const transportGroups: Record<'air' | 'sea' | 'land', number> = {
      air: 0,
      sea: 0,
      land: 0,
    }

    const weights: Record<'air' | 'sea' | 'land', number> = {
      air: 0,
      sea: 0,
      land: 0,
    }

    logs.forEach((log) => {
      const distance = log.distance_km || 5000
      const factor = emissionFactors[log.transport_type]
      const emissions = (log.weight_kg * distance * factor) / 1000
      transportGroups[log.transport_type] += emissions
      weights[log.transport_type] += log.weight_kg
    })

    const totalEmissions =
      transportGroups.air + transportGroups.sea + transportGroups.land
    const maxEmissions = Math.max(
      ...Object.values(transportGroups),
      totalEmissions * 0.3
    )

    // Create trees with carbon scores (0-100, inverted: higher emissions = lower score)
    const newTrees: TreeData[] = [
      {
        transportType: 'air',
        carbonScore: Math.max(
          0,
          100 - (transportGroups.air / maxEmissions) * 100
        ),
        position: { x: 0.2, y: 0.5 },
        totalEmissions: transportGroups.air,
      },
      {
        transportType: 'sea',
        carbonScore: Math.max(
          0,
          100 - (transportGroups.sea / maxEmissions) * 100
        ),
        position: { x: 0.5, y: 0.5 },
        totalEmissions: transportGroups.sea,
      },
      {
        transportType: 'land',
        carbonScore: Math.max(
          0,
          100 - (transportGroups.land / maxEmissions) * 100
        ),
        position: { x: 0.8, y: 0.5 },
        totalEmissions: transportGroups.land,
      },
    ]

    setTrees(newTrees)
    const avgScore =
      newTrees.reduce((sum, tree) => sum + tree.carbonScore, 0) / newTrees.length
    setOverallCarbonScore(avgScore)
    setDisplayScore(avgScore)
  }, [logs])

  // When a specific route is selected, highlight that transport type's tree
  useEffect(() => {
    if (selectedRoute) {
      const selectedTree = trees.find(
        (tree) => tree.transportType === selectedRoute.transport_type
      )
      if (selectedTree) {
        setSelectedTreeData(selectedTree)
      }
    } else {
      setSelectedTreeData(null)
    }
  }, [selectedRoute, trees])

  // Handle preview score animation
  useEffect(() => {
    if (previewScore !== null && previewScore !== undefined) {
      setDisplayScore(previewScore)
    } else {
      setDisplayScore(overallCarbonScore)
    }
  }, [previewScore, overallCarbonScore])

  const getTransportIcon = (type: 'air' | 'sea' | 'land'): string => {
    switch (type) {
      case 'air':
        return '✈️'
      case 'sea':
        return '🚢'
      case 'land':
        return '🚛'
    }
  }

  return (
    <div className="w-full h-full relative bg-[#070B10] rounded-none lg:rounded-tl-2xl overflow-hidden shadow-inner">
      {/* Main Canvas - Optimized View */}
      <div className="absolute inset-0 pointer-events-none">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-eco-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading supply chain data...</p>
            </div>
          </div>
        ) : (
          <P5TreeWrapper
            trees={trees}
            overallScore={previewScore ?? displayScore}
            isPreview={previewScore !== null && previewScore !== undefined}
            selectedTransportType={selectedRoute?.transport_type || null}
          />
        )}
      </div>
    </div>
  )
}
