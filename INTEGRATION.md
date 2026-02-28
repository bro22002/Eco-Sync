# Eco-Sync Full Stack Integration Guide

This guide covers setting up and running both the Eco-Sync MCP server and the Next.js dashboard together.

## 📦 Project Structure

```
Eco-Sync/
├── src/                           # MCP Server (TypeScript)
│   ├── index.ts                   # MCP server implementation
│   └── carbon_calculator.ts       # Calculation logic
├── data/
│   └── supply_chain_records.json  # Mock database
├── dist/                          # Compiled MCP server
├── dashboard/                     # Next.js Dashboard
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── package.json                   # Root MCP server package
├── tsconfig.json                  # MCP server TypeScript config
├── README.md                      # MCP Server documentation
└── .env                           # Server configuration
```

## 🚀 Quick Start (Both Services)

### 1. Install Dependencies

```bash
# MCP Server dependencies (root)
npm install

# Dashboard dependencies
cd dashboard
npm install
cd ..
```

### 2. Configure Environment Files

```bash
# MCP Server (.env in root)
# Already configured with defaults

# Dashboard (.env.local in dashboard/)
# Already configured with defaults
```

### 3. Build Both Services

```bash
# Build MCP Server
npm run build

# Build Dashboard
cd dashboard
npm run build
cd ..
```

### 4. Run Both Services

**Option A: Two Terminal Windows (Recommended for Development)**

Terminal 1 - MCP Server:
```bash
npm start
# Output: Eco-Sync MCP server running
```

Terminal 2 - Dashboard:
```bash
cd dashboard
npm run dev
# Output: ▲ Next.js 15
#         - Local: http://localhost:3000
```

**Option B: Concurrent (with npm-run-all)**

```bash
npm install --save-dev npm-run-all

# Add to root package.json scripts:
# "dev": "npm-run-all --parallel dev:server dev:dashboard",
# "dev:server": "node dist/index.js",
# "dev:dashboard": "cd dashboard && npm run dev"

npm run dev
```

## 🏗️ Architecture Overview

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Eco-Sync Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌─────────────────────┐  │
│  │   MCP Server     │              │  Next.js Dashboard  │  │
│  │   (Node.js)      │◄─────────────►│   (React)           │  │
│  │                  │   HTTP/STDIO  │                     │  │
│  ├──────────────────┤              ├─────────────────────┤  │
│  │ • Supply Chain   │              │ • Visualization     │  │
│  │ • Carbon Calc    │              │ • Real-time Logs    │  │
│  │ • EPA Factors    │              │ • Analytics         │  │
│  └────────┬─────────┘              └────────┬────────────┘  │
│           │                                  │                │
│           ▼                                  ▼                │
│  ┌──────────────────┐              ┌─────────────────────┐  │
│  │  Mock Database   │              │   p5.js Canvas      │  │
│  │  (JSON File)     │              │   Animation         │  │
│  └──────────────────┘              └─────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### MCP Server (Backend)
- **Port**: 3000 (stdio transport)
- **Framework**: Node.js with TypeScript
- **Tools**:
  - `get_supply_chain_records` - Fetch shipment data
  - `calculate_carbon_footprint` - Calculate CO₂ emissions
- **Database**: Local JSON file with mock data
- **Configuration**: `.env` file (EPA factors, database path)

#### Next.js Dashboard (Frontend)
- **Port**: 3000 (can be changed to 3001 for parallel development)
- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS
- **Visualization**: p5.js particle system
- **Features**:
  - Real-time shipping log display
  - Interactive p5.js canvas
  - Carbon footprint metrics
  - Auto-refreshing data

## 🔄 Integration Flow

### 1. User Views Dashboard
```
1. User opens http://localhost:3000/dashboard
2. Dashboard loads Next.js app
3. App initializes React components
```

### 2. Dashboard Fetches Data
```
1. Dashboard (page.tsx) mounts
2. useEffect hook triggers data fetch
3. mcp-client.ts calls fetchSupplyChainData()
4. Returns supply chain records
5. State updated, re-render
```

### 3. Canvas Visualization
```
1. Records converted to particles
2. P5Wrapper receives particle data
3. p5.js sketch renders particles
4. Physics simulation updates positions
5. Mouse interaction detected
6. Animated canvas displayed
```

### 4. Sidebar Logs
```
1. Display fetched records
2. Call fetchCarbonEmissions()
3. Calculate emissions for each shipment
4. Enrich log data with emissions
5. Render shipping log cards
6. Update on interval (5 seconds default)
```

## 🔧 Configuration Options

### MCP Server (.env)

```env
# Database Path
DATABASE_PATH=./data/supply_chain_records.json

# EPA Emission Factors (g CO2e per kg per km)
AIR_EMISSION_FACTOR=0.255      # High emissions
SEA_EMISSION_FACTOR=0.0112     # Low emissions
LAND_EMISSION_FACTOR=0.0613    # Medium emissions

# Server
MCP_SERVER_PORT=3000
```

### Dashboard (.env.local)

```env
# MCP Server Connection
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:3000

# Dashboard Settings
NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL=5000  # ms
NEXT_PUBLIC_MAX_LOGS=50                       # records
```

## 📊 Data Structures

### Supply Chain Record
```typescript
interface SupplyChainRecord {
  id: string                          // "SC001"
  origin: string                      // "Shanghai, China"
  destination: string                 // "Los Angeles, USA"
  weight_kg: number                   // 15000
  transport_type: "air" | "sea" | "land"
  timestamp: string                   // ISO 8601
}
```

### Carbon Footprint Result
```typescript
interface CarbonFootprintResult {
  record_id: string                   // "SC001"
  transport_type: string              // "sea"
  weight_kg: number                   // 15000
  distance_km: number                 // 12000
  emission_factor_g_per_kg_km: number // 0.0112
  total_emissions_kg_co2e: number    // 2016
  route: string                       // "Shanghai... → LA..."
}
```

## 🎯 Common Workflows

### Add New Supply Chain Record

1. **Edit mock database**:
```bash
# Edit data/supply_chain_records.json
{
  "id": "SC008",
  "origin": "Bangkok, Thailand",
  "destination": "Singapore, Singapore",
  "weight_kg": 7500,
  "transport_type": "sea",
  "timestamp": "2026-02-25T12:00:00Z"
}
```

2. **Restart services** for changes to take effect

3. **Dashboard auto-refreshes** to show new record

### Change Emission Factors

1. **Update .env**:
```bash
AIR_EMISSION_FACTOR=0.300  # Example: updated value
```

2. **Restart MCP server**
3. **Dashboard recalculates** emissions automatically

### Connect Real Data Source

Instead of mock JSON:

1. **Update carbon_calculator.ts**:
```typescript
// Replace JSON file with database query
async loadDatabase(): Promise<void> {
  // this.records = await database.query("SELECT * FROM shipments")
}
```

2. **Update mcp-client.ts**:
```typescript
// Replace simulated responses with real API calls
export async function fetchSupplyChainData() {
  const response = await fetch('/api/supply-chain')
  return response.json()
}
```

## 🔒 Security Considerations

### Development
- ✅ Local testing only
- ✅ No authentication required
- ✅ CORS disabled (single-origin)

### Production Deployment
1. **Add API Authentication**
   - JWT tokens
   - API keys
   - OAuth 2.0

2. **Enable HTTPS**
   - All traffic encrypted
   - Install SSL certificates
   - Redirect HTTP to HTTPS

3. **Implement Rate Limiting**
   - Prevent abuse
   - Quota per user/IP
   - Exponential backoff

4. **Secure Environment Variables**
   - Never commit `.env` files
   - Use hosting platform secrets
   - Rotate regularly

5. **Input Validation**
   - Validate all API inputs
   - Sanitize display data
   - Use parameterized queries

## 🧪 Testing the Integration

### Manual Testing Checklist

- [ ] MCP server starts without errors
- [ ] Dashboard loads on http://localhost:3000
- [ ] Shipping logs displayed in sidebar
- [ ] Canvas animation running smoothly
- [ ] Carbon emissions calculated correctly
- [ ] On-hover particle info shows details
- [ ] Auto-refresh happens every 5 seconds
- [ ] Browser console has no errors

### Load Testing

```bash
# Simulate concurrent users
npx autocannon http://localhost:3000

# Monitor performance
open chrome://inspect  # DevTools Performance
```

## 📈 Performance Optimization

### MCP Server
- Caching results for repeated calculations
- Indexing database by transport type
- Lazy loading for large datasets

### Dashboard
- Code splitting (Next.js automatic)
- Image optimization
- CSS purging (Tailwind)
- Component memoization

### Network
- Polling interval: 5 seconds (configurable)
- Compressed responses (gzip)
- Cache headers for static assets

## 🚨 Troubleshooting

### "Port 3000 already in use"
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port for dashboard:
PORT=3001 npm run dev
```

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# For dashboard
cd dashboard && rm -rf node_modules && npm install
```

### Dashboard not connecting to server
```
1. Verify MCP server running: `npm start`
2. Check .env.local: NEXT_PUBLIC_MCP_SERVER_URL
3. Check browser console for errors
4. Verify CORS if cross-origin
```

### Canvas not rendering
```
1. Check p5.js loaded: DevTools > Network > p5.js
2. Check for JavaScript errors: DevTools > Console
3. Verify container dimensions: DevTools > Inspector
4. Restart dashboard: Ctrl+C, then npm run dev
```

## 📚 Documentation References

- [MCP Server README](./README.md)
- [Dashboard README](./dashboard/README.md)
- [Dashboard Setup Guide](./dashboard/SETUP.md)
- [Usage Examples](./EXAMPLES.md)

## 🔄 Development Workflow

### Making Changes

**MCP Server Changes**:
```bash
# Edit src/carbon_calculator.ts or src/index.ts
npm run build         # Compile TypeScript
npm start             # Run compiled JavaScript
```

**Dashboard Changes**:
```bash
cd dashboard
npm run dev           # Auto-reloads on file changes
# Edit components/*, app/*, etc
# Browser auto-refreshes
```

### Committing to Git

```bash
# Only commit source files, exclude:
# - node_modules/
# - dist/
# - .next/
# - .env (local files)

git add .
git commit -m "feat: add new supply chain features"
```

## 🎓 Learning Resources

### Understanding the Stack

- **TypeScript**: https://www.typescriptlang.org/docs
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **p5.js**: https://p5js.org/learn

### Carbon Footprint

- [EPA Emission Factors](https://www.epa.gov/sites/production/files/2016-08/documents/emissions_factors_2014.pdf)
- [Carbon Footprint Methodology](https://www.carbontrust.com/what-we-do/assurance/pcs-2050-assurance)

## 📞 Support

For issues or questions:

1. Check [troubleshooting section](#troubleshooting)
2. Review component READMEs
3. Check browser console for errors
4. Verify environment configuration

---

**Happy visualizing and optimizing for sustainability! 🌍✨**
