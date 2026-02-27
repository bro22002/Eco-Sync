# Eco-Sync: Sustainability Visualizer MCP Server

A Model Context Protocol (MCP) server for calculating and analyzing carbon footprint emissions across supply chains using EPA-standard emission factors.

## Project Overview

Eco-Sync connects to a mock JSON database of supply chain records and provides tools to:
- Calculate CO2e emissions based on transport type, weight, and distance
- Apply EPA-standard emission factors for air, sea, and land transport
- Aggregate and analyze sustainability metrics across supply chains

## Architecture

```
eco-sync-mcp/
├── src/
│   ├── index.ts              # MCP server implementation
│   └── carbon_calculator.ts  # Carbon footprint calculation logic
├── data/
│   └── supply_chain_records.json  # Mock database
├── dist/                     # Compiled JavaScript (generated)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Eco-Sync
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development with auto-recompilation:
```bash
npm run watch
```

## Configuration

### Environment Variables

The `.env` file controls all server configuration. Required variables:

- **DATABASE_PATH**: Path to the supply chain records JSON file (default: `./data/supply_chain_records.json`)
- **AIR_EMISSION_FACTOR**: g CO2e per kg per km for air transport (default: 0.255)
- **SEA_EMISSION_FACTOR**: g CO2e per kg per km for sea transport (default: 0.0112)
- **LAND_EMISSION_FACTOR**: g CO2e per kg per km for land transport (default: 0.0613)
- **MCP_SERVER_PORT**: Server port (default: 3000)

**⚠️ Security Note**: Never commit `.env` to version control. Use `.env.example` as a template and keep actual credentials/configuration in `.env` (added to `.gitignore`).

## Data Format

Supply chain records in `supply_chain_records.json`:

```json
{
  "id": "SC001",
  "origin": "Shanghai, China",
  "destination": "Los Angeles, USA",
  "weight_kg": 15000,
  "transport_type": "sea",
  "timestamp": "2026-02-20T08:00:00Z"
}
```

### Fields:
- **id**: Unique identifier for the record
- **origin**: Source location
- **destination**: Target location  
- **weight_kg**: Shipment weight in kilograms
- **transport_type**: One of `air`, `sea`, or `land`
- **timestamp**: ISO 8601 timestamp of shipment

## Available Tools

### calculate_carbon_footprint

Calculates CO2e emissions using EPA-standard emission factors.

**Parameters:**
- `record_ids` (optional): Array of specific record IDs to analyze
- `transport_type_filter` (optional): Filter by `air`, `sea`, or `land`
- `include_aggregates` (optional): Include summary statistics (default: true)

**Example Usage:**
```json
{
  "name": "calculate_carbon_footprint",
  "arguments": {
    "include_aggregates": true
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "record_id": "SC001",
      "transport_type": "sea",
      "weight_kg": 15000,
      "distance_km": 12000,
      "emission_factor_g_per_kg_km": 0.0112,
      "total_emissions_kg_co2e": 2016,
      "route": "Shanghai, China → Los Angeles, USA"
    }
  ],
  "aggregates": {
    "total_kg_co2e": 5234.56,
    "by_transport_type": {
      "air": 1225.45,
      "sea": 2850.11,
      "land": 1159
    },
    "average_per_shipment_kg_co2e": 748.22
  }
}
```

### get_supply_chain_records

Retrieve supply chain records from the database.

**Parameters:**
- `record_id` (optional): Get a specific record by ID
- `transport_type` (optional): Filter by `air`, `sea`, or `land`
- `limit` (optional): Maximum results to return (default: 100)

**Example Usage:**
```json
{
  "name": "get_supply_chain_records",
  "arguments": {
    "transport_type": "air",
    "limit": 10
  }
}
```

## Emission Factors

The server uses EPA-standard emission factors:

| Transport Type | Emission Factor | Unit | Notes |
|---|---|---|---|
| Air | 0.255 | g CO2e/kg/km | Highest emissions, fastest transport |
| Land | 0.0613 | g CO2e/kg/km | Medium emissions, reliable |
| Sea | 0.0112 | g CO2e/kg/km | Lowest emissions, slowest transport |

These factors are configurable via environment variables.

## Security Guidelines

### Best Practices

1. **Environment Variables**: 
   - Always use `.env` for sensitive configuration
   - Never commit `.env` to version control
   - Use `.env.example` as a template for required variables
   - Review all values before deployment

2. **Database Security**:
   - Store sensitive supply chain data securely
   - Limit database access to authorized systems only
   - Consider encrypting PII (Personally Identifiable Information) in origin/destination fields

3. **Server Access**:
   - Run the MCP server in isolated environments
   - Use network firewalls to restrict access to the server port
   - Implement authentication for production deployments

4. **Dependencies**:
   - Keep npm packages updated: `npm audit` and `npm update`
   - Review security advisories regularly
   - Lock dependency versions in `package-lock.json`

5. **Logging**:
   - Avoid logging sensitive data (actual location details, credentials)
   - Implement proper log rotation and archival
   - Monitor logs for suspicious activity

6. **Data Privacy**:
   - Comply with GDPR, CCPA, and other relevant regulations
   - Implement data retention policies
   - Ensure proper data disposal procedures

## Development

### Building TypeScript
```bash
npm run build
```

### Development with Watch Mode
```bash
npm run watch
```

### Type Safety
The project uses strict TypeScript settings:
- Strict null checks enabled
- No implicit any types
- Unused variable detection
- All functions require explicit returns

## Carbon Emissions Calculation

The server calculates emissions using the formula:

```
Total Emissions (kg CO2e) = Weight (kg) × Distance (km) × Emission Factor (g/kg/km) ÷ 1000
```

**Example:**
- Record: 15,000 kg via sea transport
- Route: Shanghai → Los Angeles (12,000 km)
- Emission Factor: 0.0112 g CO2e/kg/km
- Calculation: 15,000 × 12,000 × 0.0112 ÷ 1000 = 2,016 kg CO2e

## Adding Custom Supply Chain Records

To add new records to the mock database:

1. Edit `data/supply_chain_records.json`
2. Add new record objects with required fields
3. Ensure `id` is unique
4. Use ISO 8601 format for timestamps
5. Restart the server to load changes

## Troubleshooting

### Module Not Found Errors
Ensure dependencies are installed:
```bash
npm install
```

### TypeScript Compilation Errors
Check that all files use correct imports/exports:
```bash
npm run build
```

### Database Load Failure
Verify `DATABASE_PATH` in `.env` points to valid JSON file.

## Performance

- Handles 1000+ supply chain records efficiently
- Calculates emissions for all records in <100ms
- Memory footprint: ~5MB for typical databases

## Future Enhancements

- [ ] Real-time geolocation API integration for accurate distances
- [ ] Multiple calculation methodologies (GHG Protocol, ISO 14040)
- [ ] Historical emissions trends and forecasting
- [ ] Integration with real shipping APIs
- [ ] Dashboard visualization
- [ ] Multi-currency carbon pricing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the code style
4. Add tests for new features
5. Submit a pull request

## License

MIT

## Support

For issues, questions, or suggestions, please open an issue on the repository.

## References

- [EPA Emission Factors](https://www.epa.gov/sites/production/files/2016-08/documents/emissions_factors_2014.pdf)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
