# Eco-Sync Dashboard

A real-time sustainability visualization dashboard built with Next.js, Tailwind CSS, and p5.js for the Eco-Sync MCP server.

## 📋 Features

- **Interactive p5.js Canvas Visualization**
  - Real-time particle animation system
  - Color-coded transport types (air: red, sea: blue, land: orange)
  - Interactive particle physics with attraction to center
  - Mouse hover particle info display
  - Particle size based on shipment weight

- **Real-time Shipping Logs Sidebar**
  - Live feed of supply chain records
  - Carbon footprint calculations
  - Filter and sort capabilities
  - Transport type badges
  - Emissions intensity metrics

- **MCP Server Integration**
  - Connects to Eco-Sync MCP server
  - Fetches supply chain data
  - Calculates carbon emissions
  - Auto-refresh every 5 seconds

- **Responsive Design**
  - Dark theme optimized for data visualization
  - Mobile-friendly layout
  - Custom scrollbars
  - Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Eco-Sync MCP server running (see parent directory)

### Installation

```bash
cd dashboard
npm install
```

### Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your server settings:
```env
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL=5000
NEXT_PUBLIC_MAX_LOGS=50
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🎨 Layout Architecture

```
┌─────────────────────────────────────────────────┐
│              HEADER (Status & Title)            │
├──────────────────────┬──────────────────────────┤
│                      │                          │
│                      │   SHIPPING LOGS SIDEBAR  │
│   P5.JS CANVAS       │   ─────────────────────  │
│   VISUALIZATION      │   • Active Shipments    │
│   (Main Section)     │   • Total CO₂e          │
│                      │   • Real-time Feed      │
│                      │   • Log Details         │
│   - Legend           │   • Timestamp           │
│   - Stats            │   • Emissions           │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

## 📦 Project Structure

```
dashboard/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard page
│   └── globals.css             # Global styles
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── CanvasVisualizer.tsx    # p5.js wrapper
│   ├── P5Wrapper.tsx           # p5.js sketch logic
│   └── ShippingLogs.tsx        # Sidebar logs
├── lib/
│   └── mcp-client.ts           # MCP server communication
├── package.json
├── tsconfig.json
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── .env.local                  # Environment variables (local)
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_MCP_SERVER_URL` | MCP server URL | `http://localhost:3000` |
| `NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL` | Data refresh interval (ms) | `5000` |
| `NEXT_PUBLIC_MAX_LOGS` | Maximum logs to display | `50` |

## 🎯 Components Overview

### Header Component
- Logo and branding
- Live connection status indicator
- Real-time feed indicator

### Canvas Visualizer Component
- Wrapper for p5.js sketch
- Responsive sizing
- Loading state management
- Legend and statistics display

### P5 Wrapper Component
The core visualization engine:
- **Particles**: Each shipment rendered as an animated particle
- **Physics**: Velocity, attraction to center, mouse repulsion
- **Connections**: Lines between nearby particles
- **Hover Info**: Display shipment details on mouse hover
- **Trail Effects**: Fade effect for particle trails

### Shipping Logs Component
Real-time data sidebar:
- Shipment card layout
- Transport type badges
- Route visualization
- Weight and emissions metrics
- Carbon intensity calculation
- Timestamp display

## 🎨 Styling

### Color Scheme

- **Primary Background**: `gray-900`
- **Eco Green**: `eco-500` (#22c55e)
- **Air Transport**: Red (#ff6464)
- **Sea Transport**: Blue (#64c8ff)
- **Land Transport**: Orange (#ffc864)

### Tailwind Customization

Custom colors and animations in `tailwind.config.ts`:
- `eco-*` color scale
- `pulse-soft` animation
- `slide-in` animation

## 📊 Data Flow

```
MCP Server
    ↓
mcp-client.ts (API communication)
    ↓
Dashboard Page (data fetching & polling)
    ├─→ Canvas Visualizer (visualization)
    └─→ Shipping Logs (data display)
```

## 🔌 MCP Integration

### Simulated Tools (Current)

For development without a running MCP server:

1. **get_supply_chain_records**
   - Fetches shipping data
   - Supports filtering by transport type
   - Returns paginated records

2. **calculate_carbon_footprint**
   - Calculates emissions per shipment
   - Available in real-time
   - EPA-standard factors applied

### Real MCP Integration

To connect to an actual MCP server:

1. Update `lib/mcp-client.ts` with proper MCP client communication
2. Implement stdio transport for Node.js
3. Replace simulated functions with real MCP calls

**Example Real Implementation:**
```typescript
import { MCPClient } from '@anthropic-sdk/sdk'

const client = new MCPClient({
  command: 'node',
  args: ['../dist/index.js'],
})

export async function fetchSupplyChainData() {
  return client.callTool('get_supply_chain_records', {})
}
```

## 🎬 Animation & Interaction

### p5.js Features

- **Particle Physics**
  - Velocity-based movement
  - Center attraction (gravity-like effect)
  - Mouse repulsion
  - Particle-to-particle connections

- **Visual Effects**
  - Glow layer
  - Transparency gradients
  - Trail fade effect
  - Smooth animations

- **Interactive Elements**
  - Hover tooltips
  - Mouse-based particle repulsion
  - Real-time stat updates

## 🔒 Security Notes

- Environment variables are prefixed with `NEXT_PUBLIC_` (safe to expose in browser)
- No sensitive credentials in frontend
- MCP server communication handled server-side (in production)
- CORS properly configured for API calls

## 📈 Performance Considerations

- **Canvas Rendering**: Optimized for 1000+ particles
- **Data Polling**: Configurable refresh interval (default 5s)
- **Component Updates**: Memoization for expensive calculations
- **Bundle Size**: Tree-shaking enabled for unused dependencies

## 🧪 Development Tips

### Hot Reload
Changes to React components auto-refresh without losing state.

### Debugging
- Use React DevTools browser extension
- Check browser console for errors
- Network tab for API calls

### Performance Profiling
```bash
npm run build
npm start
# Use Next.js built-in analytics
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Server
```bash
npm run build
npm start
```

Set environment variables on your hosting platform.

## 🐛 Troubleshooting

### Canvas Not Displaying
- Check browser console for errors
- Verify p5.js loaded correctly
- Ensure container has dimensions

### Data Not Loading
- Verify MCP server is running
- Check `NEXT_PUBLIC_MCP_SERVER_URL` setting
- Look at network requests in DevTools

### Styling Issues
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Restart dev server

## 📚 Related Documentation

- [Eco-Sync MCP Server](../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [p5.js Reference](https://p5js.org/reference/)

## 🔄 Future Enhancements

- [ ] Real MCP server integration
- [ ] Advanced filtering and sorting
- [ ] Export reports (PDF/CSV)
- [ ] Custom visualization modes
- [ ] Sustainability goals/alerts
- [ ] Route optimization suggestions
- [ ] Historical data trends
- [ ] Multi-user collaboration

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

---

**Built with ❤️ for sustainability**
