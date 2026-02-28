# Eco-Sync Dashboard - Installation & Setup Guide

## System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Browser**: Modern browser with ES2020+ support

## Step-by-Step Installation

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

This will install:
- Next.js 15 (React framework)
- React 19 (UI framework)
- Tailwind CSS 3 (styling)
- p5.js (canvas visualization)
- TypeScript (type safety)

### 2. Configure Environment

```bash
# Copy example to local config
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Connect to MCP server (adjust if running on different port)
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:3000

# Dashboard settings
NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL=5000  # Refresh every 5 seconds
NEXT_PUBLIC_MAX_LOGS=50                       # Show last 50 logs
```

### 3. Start Development Server

```bash
npm run dev
```

Output should show:
```
▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Connecting to MCP Server

### Option A: Use Simulated Data (Recommended for Development)

The dashboard includes simulated MCP responses with realistic supply chain data. No additional setup needed!

### Option B: Connect to Real MCP Server

1. **Start the MCP Server** (in parent directory):
```bash
cd ..
npm start
```

2. **Update mcp-client.ts** to enable real integration:

In `lib/mcp-client.ts`, update the `callMCPTool` function to make real HTTP requests:

```typescript
export async function callMCPTool(name: string, args: Record<string, unknown>) {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/tools/${name}`, {
      arguments: args,
    })
    return response.data
  } catch (error) {
    console.error(`Error calling MCP tool ${name}:`, error)
    throw error
  }
}
```

3. **Restart the Dashboard**:
```bash
npm run dev
```

## Project Structure

```
dashboard/
├── app/
│   ├── page.tsx                    # Main dashboard page
│   ├── layout.tsx                  # Root layout wrapper
│   └── globals.css                 # Global Tailwind styles
│
├── components/
│   ├── Header.tsx                  # Top navbar
│   ├── CanvasVisualizer.tsx       # Canvas wrapper
│   ├── P5Wrapper.tsx              # p5.js sketch implementation
│   └── ShippingLogs.tsx           # Sidebar logs panel
│
├── lib/
│   └── mcp-client.ts              # MCP API client
│
├── public/                         # Static assets (if needed)
│
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts             # Tailwind customization
├── next.config.js                 # Next.js customization
├── postcss.config.js              # PostCSS for Tailwind
├── .env.local                     # Local environment (ignored by git)
├── .env.example                   # Example environment
└── .gitignore                     # Git ignore patterns
```

## Available Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm start

# Run linter
npm run lint
```

## Development Workflow

1. **Make changes** to components in `components/` or `app/`
2. **Save file** → Next.js auto-recompiles
3. **Browser refreshes** automatically
4. **See changes** immediately (with preserved state when possible)

## Key Features Explained

### Header Component
- Logo with gradient icon
- Live connection status
- Real-time indicator

### Canvas Visualization (p5.js)
- **Particles**: Each shipment shown as animated circle
- **Size**: Proportional to shipping weight
- **Color**: 
  - 🔴 Red = Air (high emissions)
  - 🟢 Green = Sea (low emissions)
  - 🟡 Yellow = Land (medium emissions)
- **Physics**: Particles attracted to center, repelled by mouse
- **Connections**: Lines connect nearby particles
- **Hover**: Show shipment details on hover

### Shipping Logs Sidebar
- List of all active shipments
- Transport type badge
- Origin → Destination route
- Weight in kg
- CO₂ emissions in kg
- Carbon intensity (emissions per kg shipped)
- Timestamp of shipment

## Styling System

### Color Palette
All colors defined in `tailwind.config.ts`:

```typescript
colors: {
  eco: {
    500: '#22c55e',  // Primary green
    600: '#16a34a',  // Darker green
  }
}
```

### Responsive Classes
- `flex`, `grid` for layout
- `rounded`, `shadow` for effects
- `hover:`, `focus:` for interactivity
- `animate-` for animations

### Custom Animations
```typescript
animation: {
  'pulse-soft': 'pulse 3s ease-in-out',
  'slide-in': 'slideIn 0.3s ease-out',
}
```

## Troubleshooting

### Issue: Page shows blank/white screen

**Solution:**
1. Check browser console for errors
2. Clear browser cache: `Ctrl+Shift+Del`
3. Restart dev server: `npm run dev`

### Issue: p5.js canvas not displaying

**Solution:**
1. Verify p5 installed: `npm list p5`
2. Check for JavaScript errors in console
3. Ensure container has dimensions

### Issue: Data not loading

**Solution:**
1. Verify MCP server running (if using real integration)
2. Check `.env.local` configuration
3. Look at network tab in DevTools
4. Check console for errors

### Issue: Styling looks wrong

**Solution:**
1. Clear Next.js build: `rm -rf .next`
2. Rebuild: `npm run build`
3. Restart dev server

## Performance Tips

1. **Canvas Performance**
   - p5.js uses requestAnimationFrame for 60 FPS
   - Rendering optimized for 1000+ particles
   - Use browser DevTools Performance tab to profile

2. **Network Performance**
   - Data fetched every 5 seconds (configurable)
   - Consider caching for faster loads
   - Monitor bundle size: `npm run build`

3. **React Performance**
   - Components use proper memoization
   - Event handlers optimized
   - State updates batched

## Next Steps

1. ✅ Start development server
2. ✅ Explore the dashboard
3. ✅ Connect MCP server (optional)
4. ✅ Customize colors/layout
5. ✅ Deploy to production

## Deployment Checklist

Before deploying to production:

- [ ] Set environment variables on hosting platform
- [ ] Run `npm run build` successfully
- [ ] Test with `npm start` locally
- [ ] Update MCP server URL if needed
- [ ] Test all features in prod environment
- [ ] Enable HTTPS for security

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **p5.js Docs**: https://p5js.org/reference/
- **React Docs**: https://react.dev

---

**Happy visualizing! 🌍✨**
