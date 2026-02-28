import axios from 'axios'

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3000'

interface MCPRequest {
  name: string
  arguments: Record<string, unknown>
}

interface MCPResponse {
  content: Array<{
    type: string
    text: string
  }>
  isError?: boolean
}

export async function callMCPTool(name: string, args: Record<string, unknown>) {
  try {
    // Note: In production, you'd use a proper API gateway
    // For now, we'll simulate MCP calls with local JSON data
    return simulateMCPCall(name, args)
  } catch (error) {
    console.error(`Error calling MCP tool ${name}:`, error)
    throw error
  }
}

function simulateMCPCall(name: string, args: Record<string, unknown>) {
  // Simulate MCP server responses
  // In production, integrate with actual stdio-based MCP server
  
  switch (name) {
    case 'get_supply_chain_records':
      return simulateSupplyChainRecords(args)
    case 'calculate_carbon_footprint':
      return simulateCarbonEmissions(args)
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

function simulateSupplyChainRecords(args: Record<string, unknown>) {
  // This would be replaced with actual MCP server call
  const records = [
    {
      id: 'SC001',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      weight_kg: 15000,
      transport_type: 'sea',
      timestamp: '2026-02-20T08:00:00Z',
    },
    {
      id: 'SC002',
      origin: 'Tokyo, Japan',
      destination: 'New York, USA',
      weight_kg: 8500,
      transport_type: 'air',
      timestamp: '2026-02-21T14:30:00Z',
    },
    {
      id: 'SC003',
      origin: 'Berlin, Germany',
      destination: 'Paris, France',
      weight_kg: 2200,
      transport_type: 'land',
      timestamp: '2026-02-22T10:15:00Z',
    },
    {
      id: 'SC004',
      origin: 'Singapore, Singapore',
      destination: 'Dubai, UAE',
      weight_kg: 12000,
      transport_type: 'sea',
      timestamp: '2026-02-19T09:45:00Z',
    },
    {
      id: 'SC005',
      origin: 'Mumbai, India',
      destination: 'London, UK',
      weight_kg: 5600,
      transport_type: 'air',
      timestamp: '2026-02-23T16:20:00Z',
    },
    {
      id: 'SC006',
      origin: 'Mexico City, Mexico',
      destination: 'Toronto, Canada',
      weight_kg: 3400,
      transport_type: 'land',
      timestamp: '2026-02-24T11:00:00Z',
    },
    {
      id: 'SC007',
      origin: 'Rotterdam, Netherlands',
      destination: 'Hamburg, Germany',
      weight_kg: 18500,
      transport_type: 'sea',
      timestamp: '2026-02-18T07:30:00Z',
    },
  ]

  // Filter based on arguments
  if (args.record_id) {
    return {
      records: records.filter((r) => r.id === args.record_id),
      total_count: 1,
      returned_count: 1,
    }
  }

  if (args.transport_type) {
    const filtered = records.filter((r) => r.transport_type === args.transport_type)
    return {
      records: filtered,
      total_count: filtered.length,
      returned_count: filtered.length,
    }
  }

  return {
    records,
    total_count: records.length,
    returned_count: records.length,
  }
}

function simulateCarbonEmissions(args: Record<string, unknown>) {
  // Simulate carbon emission calculations
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

  const records = [
    {
      id: 'SC001',
      transport_type: 'sea',
      weight_kg: 15000,
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
    },
    {
      id: 'SC002',
      transport_type: 'air',
      weight_kg: 8500,
      origin: 'Tokyo, Japan',
      destination: 'New York, USA',
    },
    {
      id: 'SC003',
      transport_type: 'land',
      weight_kg: 2200,
      origin: 'Berlin, Germany',
      destination: 'Paris, France',
    },
    {
      id: 'SC004',
      transport_type: 'sea',
      weight_kg: 12000,
      origin: 'Singapore, Singapore',
      destination: 'Dubai, UAE',
    },
    {
      id: 'SC005',
      transport_type: 'air',
      weight_kg: 5600,
      origin: 'Mumbai, India',
      destination: 'London, UK',
    },
    {
      id: 'SC006',
      transport_type: 'land',
      weight_kg: 3400,
      origin: 'Mexico City, Mexico',
      destination: 'Toronto, Canada',
    },
    {
      id: 'SC007',
      transport_type: 'sea',
      weight_kg: 18500,
      origin: 'Rotterdam, Netherlands',
      destination: 'Hamburg, Germany',
    },
  ]

  let filtered = records

  // Apply filters
  if (args.record_ids && Array.isArray(args.record_ids)) {
    filtered = filtered.filter((r) => (args.record_ids as string[]).includes(r.id))
  }

  if (args.transport_type_filter) {
    filtered = filtered.filter((r) => r.transport_type === args.transport_type_filter)
  }

  const results = filtered.map((record) => {
    const factor = emissionFactors[record.transport_type]
    const key = `${record.origin}-${record.destination}`
    const distance = distances[key] || 5000
    const emissions = (record.weight_kg * distance * factor) / 1000

    return {
      record_id: record.id,
      transport_type: record.transport_type,
      weight_kg: record.weight_kg,
      distance_km: distance,
      emission_factor_g_per_kg_km: factor,
      total_emissions_kg_co2e: Math.round(emissions * 100) / 100,
      route: `${record.origin} → ${record.destination}`,
    }
  })

  const response: Record<string, unknown> = {
    results,
    record_count: filtered.length,
  }

  if (args.include_aggregates !== false) {
    const total = results.reduce((sum, r) => sum + r.total_emissions_kg_co2e, 0)
    const byType: Record<string, number> = {}

    results.forEach((r) => {
      byType[r.transport_type] = (byType[r.transport_type] || 0) + r.total_emissions_kg_co2e
    })

    response.aggregates = {
      total_kg_co2e: Math.round(total * 100) / 100,
      by_transport_type: Object.fromEntries(
        Object.entries(byType).map(([key, val]) => [key, Math.round(val * 100) / 100])
      ),
      average_per_shipment_kg_co2e:
        results.length > 0 ? Math.round((total / results.length) * 100) / 100 : 0,
    }
  }

  return response
}

export async function fetchSupplyChainData() {
  return simulateSupplyChainRecords({})
}

export async function fetchCarbonEmissions() {
  return simulateCarbonEmissions({ include_aggregates: true })
}

export async function fetchSupplyChainDataByTransport(type: string) {
  return simulateSupplyChainRecords({ transport_type: type })
}

export async function fetchCarbonEmissionsByTransport(type: string) {
  return simulateCarbonEmissions({ transport_type_filter: type, include_aggregates: true })
}
