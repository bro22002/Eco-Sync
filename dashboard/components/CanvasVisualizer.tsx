'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

interface CanvasVisualizerProps {
  logs: Array<{
    id: string
    origin: string
    destination: string
    weight_kg: number
    transport_type: 'air' | 'sea' | 'land'
    timestamp: string
  }>
  isLoading: boolean
  previewScore?: number | null
}

// Dynamically import p5.js tree visualization to avoid SSR issues
const P5TreeWrapper = dynamic(() => import('@/components/P5TreeWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-eco-400"></div>
        <p className="text-gray-400 mt-2">Growing carbon footprint trees...</p>
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

export default function CanvasVisualizer({ logs, isLoading, previewScore }: CanvasVisualizerProps) {
  const [trees, setTrees] = useState<TreeData[]>([])
  const [overallCarbonScore, setOverallCarbonScore] = useState(0)
  const [displayScore, setDisplayScore] = useState(0) // For preview animation

  useEffect(() => {
    // Calculate carbon scores based on transport type and emissions
    const emissionFactors: Record<string, number> = {
      air: 0.255,
      sea: 0.0112,
      land: 0.0613,
    }

    const distances: Record<string, number> = {
      'Shanghai, China-Los Angeles, USA': 12000,
      'Tokyo, Japan-New York, USA': 10800,
      'Berlin, Germany-Paris, France': 880,
      'Singapore, Singapore-Dubai, UAE': 3600,
      'Mumbai, India-London, UK': 7200,
      'Mexico City, Mexico-Toronto, Canada': 2100,
      'Rotterdam, Netherlands-Hamburg, Germany': 450,
    }

    // Process each log and create tree data
    let totalEmissions = 0
    const treesByType: Record<string, { carbonScore: number; totalEmissions: number; count: number }> = {
      air: { carbonScore: 0, totalEmissions: 0, count: 0 },
      sea: { carbonScore: 0, totalEmissions: 0, count: 0 },
      land: { carbonScore: 0, totalEmissions: 0, count: 0 },
    }

    logs.forEach((log) => {
      const factor = emissionFactors[log.transport_type]
      const key = `${log.origin}-${log.destination}`
      const distance = distances[key] || 5000
      const emissions = (log.weight_kg * distance * factor) / 1000

      totalEmissions += emissions
      treesByType[log.transport_type].totalEmissions += emissions
      treesByType[log.transport_type].count += 1
      treesByType[log.transport_type].carbonScore = emissions
    })

    // Normalize carbon scores (0-100 scale, where 100 is worst)
    const maxEmissions = Math.max(
      treesByType.air.totalEmissions,
      treesByType.sea.totalEmissions,
      treesByType.land.totalEmissions,
      1 // Avoid division by zero
    )

    // Create trees for each transport type with multiple instances
    const newTrees: TreeData[] = []
    const transportTypes: Array<'air' | 'sea' | 'land'> = ['air', 'sea', 'land']
    const positions = [
      { x: 0.2, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.8, y: 0.5 },
    ]

    transportTypes.forEach((type, index) => {
      const typeData = treesByType[type]
      // Carbon score normalized to 0-100 (higher = more emissions)
      const carbonScore = (typeData.totalEmissions / maxEmissions) * 100
      
      newTrees.push({
        transportType: type,
        carbonScore: Math.min(carbonScore, 100),
        position: positions[index],
        totalEmissions: typeData.totalEmissions,
      })
    })

    setTrees(newTrees)
    // Overall carbon score
    const overallScore = (totalEmissions / (maxEmissions * 3)) * 100
    setOverallCarbonScore(Math.min(overallScore, 100))
  }, [logs])

  // Handle preview score animation
  useEffect(() => {
    if (previewScore !== undefined && previewScore !== null) {
      setDisplayScore(previewScore)
    } else {
      setDisplayScore(overallCarbonScore)
    }
  }, [previewScore, overallCarbonScore])

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
      {isLoading && trees.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-pulse">
              <div className="w-12 h-12 bg-eco-500 rounded-lg"></div>
            </div>
            <p className="text-gray-300 mt-4">Analyzing carbon footprint...</p>
          </div>
        </div>
      ) : (
        <P5TreeWrapper 
          trees={trees} 
          overallCarbonScore={displayScore}
          isPreview={previewScore !== undefined && previewScore !== null}
        />
      )}

      {/* Carbon Score Legend */}
      <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur rounded-lg p-4 text-sm border border-eco-600/30">
        <div className="mb-3 font-semibold text-eco-400">Carbon Health</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(34, 197, 94)' }}></div>
            <span className="text-green-400">Low Emissions (Green Leaves)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(245, 158, 11)' }}></div>
            <span className="text-yellow-400">Medium Emissions (Yellow)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(139, 69, 19)' }}></div>
            <span className="text-amber-700">High Emissions (Brown Leaves)</span>
          </div>
        </div>
      </div>

      {/* Transport Type Info */}
      <div className="absolute top-6 left-6 bg-black/70 backdrop-blur rounded-lg p-4 text-sm border border-eco-600/30">
        <div className="mb-2 font-semibold text-eco-400">Supply Chain Trees</div>
        <div className="space-y-1 text-xs text-gray-300">
          <div>🌳 Left: Air Transport</div>
          <div>🌳 Center: Sea Transport</div>
          <div>🌳 Right: Land Transport</div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-600">
          <p className="text-gray-300">Overall Score: <span className="text-eco-400 font-semibold">{overallCarbonScore.toFixed(1)}/100</span></p>
        </div>
      </div>

      {/* Statistics */}
      <div className="absolute top-6 right-6 bg-black/70 backdrop-blur rounded-lg p-4 text-sm border border-eco-600/30">
        <div className="space-y-2">
          <div>
            <p className="text-gray-400 text-xs">Total Shipments</p>
            <p className="text-eco-400 font-semibold text-lg">{logs.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Total Weight</p>
            <p className="text-eco-400 font-semibold">{logs.reduce((sum, log) => sum + log.weight_kg, 0).toLocaleString()} kg</p>
          </div>
          {trees.length > 0 && (
            <div className="pt-2 border-t border-gray-600">
              <p className="text-gray-400 text-xs">Air: {trees[0]?.totalEmissions.toFixed(0)} kg CO₂e</p>
              <p className="text-gray-400 text-xs">Sea: {trees[1]?.totalEmissions.toFixed(0)} kg CO₂e</p>
              <p className="text-gray-400 text-xs">Land: {trees[2]?.totalEmissions.toFixed(0)} kg CO₂e</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 right-6 bg-black/70 backdrop-blur rounded-lg p-3 text-xs text-gray-400 max-w-xs">
        <p><strong>Tree Size:</strong> Larger branches = Higher emissions</p>
        <p className="mt-1"><strong>Leaf Color:</strong> Green = Sustainable, Brown = High Impact</p>
      </div>
    </div>
  )
}
