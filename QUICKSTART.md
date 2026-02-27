# Eco-Sync MCP Server - Quick Start Guide

## ✅ Project Status: Ready to Use

Your Eco-Sync MCP server has been successfully scaffolded and built!

## 📋 What's Been Created

### Core Files
- **src/index.ts** - Main MCP server implementation with tool handlers
- **src/carbon_calculator.ts** - Carbon footprint calculation logic and database management
- **data/supply_chain_records.json** - Mock database with 7 sample supply chain records

### Configuration Files
- **package.json** - Dependencies and build scripts
- **tsconfig.json** - TypeScript compiler configuration
- **.env** - Environment variables (pre-configured with defaults)
- **.env.example** - Template for environment variables
- **.gitignore** - Git ignore rules

### Documentation
- **README.md** - Comprehensive documentation with security guidelines

---

## 🚀 Getting Started

### 1. Verify Installation
Dependencies are already installed. Verify with:
```bash
npm list
```

### 2. Build the Project
If you make TypeScript changes:
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
```

You should see:
```
Eco-Sync MCP server running
```

---

## 🛠️ API Tools Available

### 1. **calculate_carbon_footprint**
Calculates CO2e emissions using EPA-standard factors.

**Sample Call:**
```json
{
  "name": "calculate_carbon_footprint",
  "arguments": {
    "include_aggregates": true
  }
}
```

**Returns:**
- Individual shipment emissions with breakdown
- Route information and distances
- Aggregate statistics by transport type

### 2. **get_supply_chain_records**
Retrieves supply chain records from the database.

**Sample Call:**
```json
{
  "name": "get_supply_chain_records",
  "arguments": {
    "transport_type": "sea"
  }
}
```

---

## 📊 EPA Emission Factors (Configured)

- **Air**: 0.255 g CO2e/kg/km (highest impact)
- **Sea**: 0.0112 g CO2e/kg/km (lowest impact)
- **Land**: 0.0613 g CO2e/kg/km (moderate impact)

All factors are configurable via `.env` file.

---

## 🔐 Security Features

✅ **Environment Variables**: All sensitive config in `.env` (excluded from git)
✅ **TypeScript**: Strict type safety enabled
✅ **Dependencies**: No vulnerabilities (npm audit passed)
✅ **.gitignore**: Properly configured

---

## 📊 Sample Database

The project includes 7 sample supply chain records covering:
- Shanghai → Los Angeles (sea, 15,000 kg)
- Tokyo → New York (air, 8,500 kg)
- Berlin → Paris (land, 2,200 kg)
- Singapore → Dubai (sea, 12,000 kg)
- Mumbai → London (air, 5,600 kg)
- Mexico City → Toronto (land, 3,400 kg)
- Rotterdam → Hamburg (sea, 18,500 kg)

---

## 🔧 Customization

### Add More Records
Edit `data/supply_chain_records.json` and add new records with:
- `id` (unique identifier)
- `origin` and `destination` (location names)
- `weight_kg` (shipment weight)
- `transport_type` (air/sea/land)
- `timestamp` (ISO 8601 format)

### Change Emission Factors
Update `.env` with new EPA factors:
```
AIR_EMISSION_FACTOR=0.255
SEA_EMISSION_FACTOR=0.0112
LAND_EMISSION_FACTOR=0.0613
```

### Configure Distance Lookup
Edit the `calculateDistance` method in `src/carbon_calculator.ts` to add more routes or integrate a real geolocation API.

---

## 📁 Project Structure

```
Eco-Sync/
├── src/
│   ├── index.ts                    # MCP server & tool handlers
│   └── carbon_calculator.ts        # Calculation logic
├── dist/                           # Compiled JavaScript (auto-generated)
├── data/
│   └── supply_chain_records.json   # Mock database
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── .env                            # Configuration (live)
├── .env.example                    # Configuration template
├── .gitignore                      # Git ignore rules
└── README.md                       # Full documentation
```

---

## 🔍 Verification Checklist

- [x] Project scaffolded with Node.js + TypeScript
- [x] MCP server implemented
- [x] `calculate_carbon_footprint` tool created
- [x] Mock database with 7 supply chain records
- [x] EPA emission factors applied (air/sea/land)
- [x] .env configuration with sensible defaults
- [x] Security guidelines in README
- [x] TypeScript compilation successful
- [x] No vulnerabilities in dependencies
- [x] Build scripts configured (build, start, dev, watch)

---

## 📚 Next Steps

1. **Extend the Database**: Add more supply chain records to `data/supply_chain_records.json`
2. **Integrate with Real Data**: Replace mock DB with actual supply chain data source
3. **Add Authentication**: Implement API authentication if exposing publicly
4. **Enable Real Geolocation**: Integrate Google Maps or OpenRouteService API for actual distances
5. **Add Visualization**: Create a web dashboard to display carbon footprint metrics
6. **Database Persistence**: Move to a real database (MongoDB, PostgreSQL, etc.)

---

## 📞 Support

See **README.md** for:
- Complete API documentation
- Security best practices
- Performance metrics
- Troubleshooting guide
- Contributing guidelines

---

**Built with ❤️ for sustainability**
