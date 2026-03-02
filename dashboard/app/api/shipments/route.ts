import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { calculateDistance } from '@/lib/openroute_service'

interface ShipmentRecord {
  id: string
  origin: string
  destination: string
  weight_kg: number
  transport_type: 'air' | 'sea' | 'land'
  timestamp: string
  distance_km?: number
}

// Cache distances to avoid repeated API calls
const distanceCache: Record<string, number> = {}

// Fallback distances if OpenRoute fails
const fallbackDistances: Record<string, number> = {
  'Shanghai, China-Los Angeles, USA': 12000,
  'Tokyo, Japan-New York, USA': 10800,
  'Berlin, Germany-Paris, France': 880,
  'Singapore, Singapore-Dubai, UAE': 3600,
  'Mumbai, India-London, UK': 7200,
  'Mexico City, Mexico-Toronto, Canada': 2100,
  'Rotterdam, Netherlands-Hamburg, Germany': 450,
}

async function enrichWithDistance(record: ShipmentRecord): Promise<ShipmentRecord> {
  const cacheKey = `${record.origin}|${record.destination}`
  
  // Return if distance already set
  if (record.distance_km) {
    return record
  }

  try {
    // Check cache first
    if (distanceCache[cacheKey]) {
      return { ...record, distance_km: distanceCache[cacheKey] }
    }

    // Fetch from OpenRoute
    const routeData = await calculateDistance({
      origin: record.origin,
      destination: record.destination,
    })
    
    const distance = routeData.distance_km
    distanceCache[cacheKey] = distance
    
    return { ...record, distance_km: distance }
  } catch (error) {
    // Silently fall back to default distance
    const fallbackKey = `${record.origin}-${record.destination}`
    const fallbackDistance = fallbackDistances[fallbackKey] || 5000
    distanceCache[cacheKey] = fallbackDistance
    
    return { ...record, distance_km: fallbackDistance }
  }
}

export async function GET() {
  try {
    let records: ShipmentRecord[] = []

    // Load from JSON file
    const jsonPath = path.join(process.cwd(), '..', 'data', 'supply_chain_records.json')
    const absPath = path.resolve(jsonPath)
    
    console.log('Looking for supply_chain_records.json at:', absPath)
    
    if (fs.existsSync(absPath)) {
      const data = fs.readFileSync(absPath, 'utf-8')
      records = JSON.parse(data)
      console.log('Loaded', records.length, 'records from JSON file')
    } else {
      console.warn('supply_chain_records.json not found at', absPath)
      return NextResponse.json({ records: [], total_count: 0, returned_count: 0 })
    }

    // Enrich each record with OpenRoute distance
    const enrichedRecords = await Promise.all(records.map((record) => enrichWithDistance(record)))

    return NextResponse.json({
      records: enrichedRecords,
      total_count: enrichedRecords.length,
      returned_count: enrichedRecords.length,
    })
  } catch (err: any) {
    console.error('API /shipments error', err)
    return NextResponse.json({ records: [], total_count: 0, returned_count: 0, error: err.message })
  }
}