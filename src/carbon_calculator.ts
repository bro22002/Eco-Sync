import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

interface SupplyChainRecord {
  id: string;
  origin: string;
  destination: string;
  weight_kg: number;
  transport_type: "air" | "sea" | "land";
  timestamp: string;
  distance_km?: number; // Now optional - will be calculated
}

interface CarbonFootprintResult {
  record_id: string;
  transport_type: string;
  weight_kg: number;
  distance_km: number;
  emission_factor_g_per_kg_km: number;
  total_emissions_kg_co2e: number;
  route: string;
}

// Distance cache to avoid repeated API calls
const distanceCache: Record<string, number> = {};

import { EasyPostService } from './easypost_service.js';
import { calculateDistance } from './openroute_service.js';

class SupplyChainDatabase {
  private records: SupplyChainRecord[] = [];
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.loadDatabase();
  }

  private async fetchFromEasyPost(): Promise<void> {
    const apiKey = process.env.EASYPOST_API_KEY;
    if (!apiKey) {
      throw new Error('EASYPOST_API_KEY not configured');
    }

    const client = new EasyPostService(apiKey);
    let page = 1;
    const all: SupplyChainRecord[] = [];

    while (true) {
      const shipments = await client.listShipments(50, page);
      if (shipments.length === 0) break;
      shipments.forEach((s, i) => {
        all.push(client.mapToRecord(s, all.length + i));
      });
      page += 1;
      if (page > 5) break; // safety: don't paginate indefinitely
    }

    this.records = all;
    console.log(`Loaded ${this.records.length} supply chain records from EasyPost`);
  }

  private loadDatabase(): void {
    // if EASYPOST_API_KEY defined, attempt to fetch live shipments
    if (process.env.EASYPOST_API_KEY) {
      this.fetchFromEasyPost().catch((err) => {
        console.error('EasyPost load failed, falling back to local file:', err);
        this.loadFromFile();
      });
    } else {
      this.loadFromFile();
    }
  }

  private loadFromFile(): void {
    try {
      const data = fs.readFileSync(this.dbPath, "utf-8");
      this.records = JSON.parse(data);
      console.log(`Loaded ${this.records.length} supply chain records`);
    } catch (error) {
      console.error("Error loading database:", error);
      this.records = [];
    }
  }

  getAllRecords(): SupplyChainRecord[] {
    return this.records;
  }

  getRecordById(id: string): SupplyChainRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  getRecordsByTransportType(type: string): SupplyChainRecord[] {
    return this.records.filter((r) => r.transport_type === type);
  }
}

class CarbonFootprintCalculator {
  private emissionFactors: {
    air: number;
    sea: number;
    land: number;
  };

  constructor() {
    this.emissionFactors = {
      air: parseFloat(process.env.AIR_EMISSION_FACTOR || "0.255"),
      sea: parseFloat(process.env.SEA_EMISSION_FACTOR || "0.0112"),
      land: parseFloat(process.env.LAND_EMISSION_FACTOR || "0.0613"),
    };
  }

  /**
   * Fallback hardcoded distances if OpenRoute fails
   */
  private getFallbackDistance(origin: string, destination: string): number {
    const routeDistances: { [key: string]: number } = {
      "Shanghai, China-Los Angeles, USA": 12000,
      "Tokyo, Japan-New York, USA": 10800,
      "Berlin, Germany-Paris, France": 880,
      "Singapore, Singapore-Dubai, UAE": 3600,
      "Mumbai, India-London, UK": 7200,
      "Mexico City, Mexico-Toronto, Canada": 2100,
      "Rotterdam, Netherlands-Hamburg, Germany": 450,
    };

    const key = `${origin}-${destination}`;
    return routeDistances[key] || 5000;
  }

  async calculateEmissions(record: SupplyChainRecord): Promise<CarbonFootprintResult> {
    let distance = record.distance_km;

    // If distance not provided, try to fetch real distance from OpenRoute
    if (!distance) {
      try {
        const cacheKey = `${record.origin}|${record.destination}`;
        if (distanceCache[cacheKey]) {
          distance = distanceCache[cacheKey];
        } else {
          const routeData = await calculateDistance({
            origin: record.origin,
            destination: record.destination,
          });
          distance = routeData.distance_km;
          distanceCache[cacheKey] = distance;
          console.log(`📍 OpenRoute: ${record.origin} → ${record.destination} = ${distance} km`);
        }
      } catch (error) {
        console.warn(
          `⚠️ OpenRoute failed for ${record.origin} → ${record.destination}, using fallback distance`
        );
        distance = this.getFallbackDistance(record.origin, record.destination);
      }
    }

    const emissionFactor = this.emissionFactors[record.transport_type] || 0.1;

    // Calculate: weight (kg) × distance (km) × emission factor (g/kg/km) = emissions (g)
    // Convert to kg: divide by 1000
    const totalEmissionsKg =
      (record.weight_kg * distance * emissionFactor) / 1000;

    return {
      record_id: record.id,
      transport_type: record.transport_type,
      weight_kg: record.weight_kg,
      distance_km: distance,
      emission_factor_g_per_kg_km: emissionFactor,
      total_emissions_kg_co2e: Math.round(totalEmissionsKg * 100) / 100,
      route: `${record.origin} → ${record.destination}`,
    };
  }

  async calculateBatchEmissions(records: SupplyChainRecord[]): Promise<CarbonFootprintResult[]> {
    return Promise.all(records.map((record) => this.calculateEmissions(record)));
  }

  calculateAggregateEmissions(results: CarbonFootprintResult[]): {
    total_kg_co2e: number;
    by_transport_type: { [key: string]: number };
    average_per_shipment_kg_co2e: number;
  } {
    const total = results.reduce((sum, r) => sum + r.total_emissions_kg_co2e, 0);
    const byType: { [key: string]: number } = {};

    results.forEach((r) => {
      byType[r.transport_type] = (byType[r.transport_type] || 0) + r.total_emissions_kg_co2e;
    });

    return {
      total_kg_co2e: Math.round(total * 100) / 100,
      by_transport_type: Object.fromEntries(
        Object.entries(byType).map(([key, val]) => [key, Math.round(val * 100) / 100])
      ),
      average_per_shipment_kg_co2e:
        results.length > 0 ? Math.round((total / results.length) * 100) / 100 : 0,
    };
  }
}

// Export for MCP server integration
export { SupplyChainDatabase, CarbonFootprintCalculator, SupplyChainRecord, CarbonFootprintResult };


