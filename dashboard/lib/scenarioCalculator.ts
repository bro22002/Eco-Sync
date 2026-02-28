/**
 * Scenario Calculator - Handles What-If scenario calculations for supply chain optimization
 * Calculates CO2 deltas when transport modes are changed
 */

import { ScenarioResult } from '@/components/SustainabilityConsultant'

// EPA emission factors (g CO2e per kg per km)
const EMISSION_FACTORS = {
  air: 0.255,
  sea: 0.0112,
  land: 0.0613,
}

// Distance lookup table
const DISTANCE_LOOKUP: Record<string, number> = {
  'Shanghai, China-Los Angeles, USA': 12000,
  'Tokyo, Japan-New York, USA': 10800,
  'Berlin, Germany-Paris, France': 880,
  'Singapore, Singapore-Dubai, UAE': 3600,
  'Mumbai, India-London, UK': 7200,
  'Mexico City, Mexico-Toronto, Canada': 2100,
  'Rotterdam, Netherlands-Hamburg, Germany': 450,
}

interface Log {
  id: string
  origin: string
  destination: string
  weight_kg: number
  transport_type: 'air' | 'sea' | 'land'
  timestamp?: string
}

interface EmissionData {
  recordId: string
  routeKey: string
  currentTransport: 'air' | 'sea' | 'land'
  weight: number
  distance: number
  currentEmissions: number
}

/**
 * Calculate scenario impact when transport type changes
 */
export async function calculateScenarioImpact(
  logs: Log[],
  sourceTransport: 'air' | 'sea' | 'land' | 'all' | null,
  targetTransport: 'air' | 'sea' | 'land' | null,
  specificRouteId?: string
): Promise<ScenarioResult> {
  // Calculate current state
  const currentEmissions = calculateTotalEmissions(logs)

  // Identify affected routes
  let affectedRoutes = logs.filter((log) => {
    if (specificRouteId && log.id !== specificRouteId) return false
    if (sourceTransport && sourceTransport !== 'all' && log.transport_type !== sourceTransport)
      return false
    return true
  })

  if (affectedRoutes.length === 0) {
    affectedRoutes = logs // Default to all if no match
  }

  // Calculate preview emissions with new transport
  let previewEmissions = currentEmissions

  if (targetTransport) {
    // Calculate emissions for affected routes with new transport type
    const affectedEmissions = affectedRoutes.reduce((sum, log) => {
      const distance = getDistance(log.origin, log.destination)
      const newFactor = EMISSION_FACTORS[targetTransport]
      return sum + (log.weight_kg * distance * newFactor) / 1000
    }, 0)

    // Calculate original emissions for affected routes
    const originalAffectedEmissions = affectedRoutes.reduce((sum, log) => {
      const distance = getDistance(log.origin, log.destination)
      const factor = EMISSION_FACTORS[log.transport_type]
      return sum + (log.weight_kg * distance * factor) / 1000
    }, 0)

    // Calculate new total
    const unaffectedEmissions = currentEmissions - originalAffectedEmissions
    previewEmissions = unaffectedEmissions + affectedEmissions
  } else if (sourceTransport === 'all') {
    // Optimize all routes to their lowest-carbon alternative
    previewEmissions = affectedRoutes.reduce((sum, log) => {
      const distance = getDistance(log.origin, log.destination)
      // Sea is almost always lowest, use that for optimization
      const factor = EMISSION_FACTORS.sea
      return sum + (log.weight_kg * distance * factor) / 1000
    }, 0)

    // Add unaffected routes
    const unaffectedTotal = logs
      .filter((log) => !affectedRoutes.some((ar) => ar.id === log.id))
      .reduce((sum, log) => {
        const distance = getDistance(log.origin, log.destination)
        const factor = EMISSION_FACTORS[log.transport_type]
        return sum + (log.weight_kg * distance * factor) / 1000
      }, 0)

    previewEmissions += unaffectedTotal
  }

  // Calculate delta and percentage change
  const delta = previewEmissions - currentEmissions
  const percentChange = (delta / currentEmissions) * 100

  // Normalize to carbon score (0-100)
  const maxEmissions = Math.max(currentEmissions, previewEmissions)
  const previewScore = ((100 - (previewEmissions / maxEmissions) * 100) * 100) / 100

  // Build affected routes list
  const affectedRoutesList = affectedRoutes.map((log) => {
    const distance = getDistance(log.origin, log.destination)
    const currentFactor = EMISSION_FACTORS[log.transport_type]
    const currentEmis = (log.weight_kg * distance * currentFactor) / 1000

    let newEmis = currentEmis
    if (targetTransport) {
      const newFactor = EMISSION_FACTORS[targetTransport]
      newEmis = (log.weight_kg * distance * newFactor) / 1000
    }

    const delta = newEmis - currentEmis
    return `${log.id}: ${log.origin.split(',')[0]} → ${log.destination.split(',')[0]} (${((delta / currentEmis) * 100).toFixed(1)}% ${delta > 0 ? 'increase' : 'reduction'})`
  })

  // Generate tailored recommendation
  const recommendation = generateRecommendation(
    targetTransport,
    sourceTransport,
    percentChange,
    affectedRoutes.length
  )

  return {
    originalEmissions: currentEmissions,
    previewEmissions,
    delta,
    percentChange,
    previewScore,
    affectedRoutes: affectedRoutesList,
    recommendation,
  }
}

/**
 * Calculate total emissions for all logs
 */
function calculateTotalEmissions(logs: Log[]): number {
  return logs.reduce((sum, log) => {
    const distance = getDistance(log.origin, log.destination)
    const factor = EMISSION_FACTORS[log.transport_type]
    const emissions = (log.weight_kg * distance * factor) / 1000
    return sum + emissions
  }, 0)
}

/**
 * Get distance for a route, with fallback
 */
function getDistance(origin: string, destination: string): number {
  const key = `${origin}-${destination}`

  if (DISTANCE_LOOKUP[key]) {
    return DISTANCE_LOOKUP[key]
  }

  // Try reverse
  const reverseKey = `${destination}-${origin}`
  if (DISTANCE_LOOKUP[reverseKey]) {
    return DISTANCE_LOOKUP[reverseKey]
  }

  // Default fallback
  return 5000
}

/**
 * Generate contextual recommendation based on scenario
 */
function generateRecommendation(
  targetTransport: 'air' | 'sea' | 'land' | null,
  sourceTransport: 'air' | 'sea' | 'land' | 'all' | null,
  percentChange: number,
  affectedCount: number
): string {
  const isImprovement = percentChange < 0

  if (isImprovement) {
    if (targetTransport === 'sea') {
      return `Switching ${affectedCount} shipment${affectedCount > 1 ? 's' : ''} to sea transport would reduce emissions by ${Math.abs(percentChange).toFixed(1)}%. This is an excellent strategic move—sea freight is 95%+ more efficient than air, and typically costs less. Consider consolidating shipments to maximize savings.`
    }

    if (targetTransport === 'land') {
      return `Shifting to land transport would reduce emissions by ${Math.abs(percentChange).toFixed(1)}%. This works well for regional routes. Optimize your warehousing network to enable more ground-based distribution.`
    }

    return `This change would reduce your carbon footprint by ${Math.abs(percentChange).toFixed(1)}%. The environmental and cost benefits make this a strong recommendation. Implement when feasible.`
  } else {
    if (targetTransport === 'air') {
      return `⚠️ Switching to air would increase emissions by ${percentChange.toFixed(1)}%. This is generally not recommended unless speed is critical. For urgent shipments, consider consolidating to reduce frequency.`
    }

    return `⚠️ This scenario would increase emissions by ${percentChange.toFixed(1)}%. Focus on reduction strategies instead. Ask me about optimizing your most carbon-intensive routes.`
  }
}

/**
 * Get transport-specific insights
 */
export function getTransportInsights(logs: Log[]): Record<string, any> {
  const byTransport: Record<string, { count: number; weight: number; emissions: number }> = {
    air: { count: 0, weight: 0, emissions: 0 },
    sea: { count: 0, weight: 0, emissions: 0 },
    land: { count: 0, weight: 0, emissions: 0 },
  }

  logs.forEach((log) => {
    const distance = getDistance(log.origin, log.destination)
    const factor = EMISSION_FACTORS[log.transport_type]
    const emissions = (log.weight_kg * distance * factor) / 1000

    byTransport[log.transport_type].count += 1
    byTransport[log.transport_type].weight += log.weight_kg
    byTransport[log.transport_type].emissions += emissions
  })

  return byTransport
}

/**
 * Identify high-impact optimization opportunities
 */
export function findOptimizationOpportunities(
  logs: Log[]
): Array<{ route: Log; savings: number; savingsPercent: number }> {
  return logs
    .map((log) => {
      const distance = getDistance(log.origin, log.destination)
      const currentFactor = EMISSION_FACTORS[log.transport_type]
      const currentEmissions = (log.weight_kg * distance * currentFactor) / 1000

      // Find best alternative
      let bestAlternative = log.transport_type
      let lowestEmissions = currentEmissions

      Object.entries(EMISSION_FACTORS).forEach(([transport, factor]) => {
        if (transport === log.transport_type) return // Skip current

        const altEmissions = (log.weight_kg * distance * factor) / 1000
        if (altEmissions < lowestEmissions) {
          lowestEmissions = altEmissions
          bestAlternative = transport as any
        }
      })

      const savings = currentEmissions - lowestEmissions
      const savingsPercent = (savings / currentEmissions) * 100

      return {
        route: log,
        savings,
        savingsPercent,
      }
    })
    .filter((opp) => opp.savings > 0)
    .sort((a, b) => b.savings - a.savings)
}
