import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  StdioServerTransport,
} from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  CarbonFootprintCalculator,
  SupplyChainDatabase,
  SupplyChainRecord,
} from "./carbon_calculator.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database and calculator
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../data/supply_chain_records.json");
const db = new SupplyChainDatabase(dbPath);
const calculator = new CarbonFootprintCalculator();

// Create MCP server
const server = new Server(
  {
    name: "eco-sync-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools: Tool[] = [
  {
    name: "calculate_carbon_footprint",
    description:
      "Calculate carbon footprint (CO2e emissions) for supply chain records based on EPA emission standards. Analyzes transport type, weight, distance, and applies EPA-standard emission factors.",
    inputSchema: {
      type: "object" as const,
      properties: {
        record_ids: {
          type: "array",
          items: { type: "string" },
          description:
            "List of record IDs to calculate emissions for. If empty, calculates for all records.",
        },
        transport_type_filter: {
          type: "string",
          enum: ["air", "sea", "land"],
          description: "Optional filter to only calculate for specific transport type",
        },
        include_aggregates: {
          type: "boolean",
          description: "Include aggregate statistics across all results",
          default: true,
        },
      },
      required: [],
    },
  },
  {
    name: "get_supply_chain_records",
    description: "Retrieve supply chain records from the database with optional filtering",
    inputSchema: {
      type: "object" as const,
      properties: {
        record_id: {
          type: "string",
          description: "Get a specific record by ID",
        },
        transport_type: {
          type: "string",
          enum: ["air", "sea", "land"],
          description: "Filter records by transport type",
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return",
          default: 100,
        },
      },
      required: [],
    },
  },
];

// Tool handlers
async function calculateCarbonFootprint(input: {
  record_ids?: string[];
  transport_type_filter?: string;
  include_aggregates?: boolean;
}): Promise<unknown> {
  let records: SupplyChainRecord[] = [];

  if (input.record_ids && input.record_ids.length > 0) {
    records = input.record_ids
      .map((id) => db.getRecordById(id))
      .filter((r): r is SupplyChainRecord => r !== undefined);
  } else if (input.transport_type_filter) {
    records = db.getRecordsByTransportType(input.transport_type_filter);
  } else {
    records = db.getAllRecords();
  }

  const results = calculator.calculateBatchEmissions(records);

  const response: unknown = {
    results,
    record_count: records.length,
  };

  if (input.include_aggregates !== false) {
    const response_with_aggregates = response as Record<string, unknown>;
    response_with_aggregates.aggregates = calculator.calculateAggregateEmissions(results);
  }

  return response;
}

async function getSupplyChainRecords(input: {
  record_id?: string;
  transport_type?: string;
  limit?: number;
}): Promise<unknown> {
  let records: SupplyChainRecord[] = [];

  if (input.record_id) {
    const record = db.getRecordById(input.record_id);
    records = record ? [record] : [];
  } else if (input.transport_type) {
    records = db.getRecordsByTransportType(input.transport_type);
  } else {
    records = db.getAllRecords();
  }

  // Apply limit
  const limit = input.limit || 100;
  const limitedRecords = records.slice(0, limit);

  return {
    records: limitedRecords,
    total_count: records.length,
    returned_count: limitedRecords.length,
  };
}

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "calculate_carbon_footprint":
        result = await calculateCarbonFootprint(
          args as Parameters<typeof calculateCarbonFootprint>[0]
        );
        break;

      case "get_supply_chain_records":
        result = await getSupplyChainRecords(
          args as Parameters<typeof getSupplyChainRecords>[0]
        );
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Eco-Sync MCP server running");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
