'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatInterface from './ChatInterface'
import { calculateScenarioImpact } from '@/lib/scenarioCalculator'
import { fetchSupplyChainData, fetchCarbonEmissions } from '@/lib/mcp-client'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  scenario?: ScenarioResult
}

export interface ScenarioResult {
  originalEmissions: number
  previewEmissions: number
  delta: number
  percentChange: number
  previewScore: number
  affectedRoutes: string[]
  recommendation: string
}

interface SustainabilityConsultantProps {
  logs: any[]
  onPreviewScoreChange?: (score: number | null) => void
  onVisualizationUpdate?: (data: any) => void
}

export default function SustainabilityConsultant({
  logs,
  onPreviewScoreChange,
  onVisualizationUpdate,
}: SustainabilityConsultantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "👋 Hello! I'm your Sustainability Consultant. I'm here to analyze your supply chain and help you explore ways to reduce carbon emissions. Ask me about:\n\n🤔 Current carbon footprint across transport types\n🔄 'What-If' scenarios (e.g., 'What if we switched route X from air to sea?')\n📊 Recommendations for the highest-impact routes\n🌱 Cost-benefit analysis of sustainability improvements",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [supplyChainData, setSupplyChainData] = useState<any>(null)
  const [carbonData, setCarbonData] = useState<any>(null)
  const [activeScenario, setActiveScenario] = useState<ScenarioResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [supply, carbon] = await Promise.all([
          fetchSupplyChainData(),
          fetchCarbonEmissions(),
        ])
        setSupplyChainData(supply)
        setCarbonData(carbon)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleUserMessage = async (userInput: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Detect scenario/what-if query
      const scenario = await detectAndCalculateScenario(userInput, logs)

      // Build assistant response
      let assistantContent = ''
      let scenarioResult: ScenarioResult | undefined

      if (scenario) {
        scenarioResult = scenario
        assistantContent = buildScenarioResponse(scenario, userInput)

        // Update visualization
        setActiveScenario(scenario)
        onPreviewScoreChange?.(scenario.previewScore)
        onVisualizationUpdate?.(scenario)
      } else {
        // General Q&A response
        assistantContent = buildGeneralResponse(userInput, supplyChainData, carbonData, logs)
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        scenario: scenarioResult,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '⚠️ I encountered an error while processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearScenario = () => {
    setActiveScenario(null)
    onPreviewScoreChange?.(null)

    const clearMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '✅ Preview cleared. You\'re back to viewing actual emissions data.',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, clearMessage])
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-eco-600/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-eco-600/20 to-eco-500/10 border-b border-eco-600/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-eco-400 flex items-center gap-2">
              🌿 Sustainability Consultant AI
            </h2>
            <p className="text-xs text-gray-400 mt-1">Powered by real-time carbon analytics</p>
          </div>
          {activeScenario && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleClearScenario}
              className="px-3 py-1 bg-amber-900/40 border border-amber-600/50 text-amber-300 text-xs rounded-lg hover:bg-amber-900/60 transition-colors"
            >
              Clear Preview
            </motion.button>
          )}
        </div>
      </div>

      {/* Active Scenario Indicator */}
      <AnimatePresence>
        {activeScenario && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-950/40 border-b border-amber-600/30 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-300">📋 Scenario Preview Active</p>
                <p className="text-xs text-amber-200/80 mt-1">
                  Original: {activeScenario.originalEmissions.toFixed(0)} kg CO₂e → Preview:{' '}
                  {activeScenario.previewEmissions.toFixed(0)} kg CO₂e
                </p>
                <p className="text-xs text-amber-300/90 mt-1 font-semibold">
                  {activeScenario.percentChange > 0 ? '❌ Increase' : '✅ Reduction'} of{' '}
                  <span
                    className={
                      activeScenario.percentChange > 0 ? 'text-red-400' : 'text-green-400'
                    }
                  >
                    {Math.abs(activeScenario.percentChange).toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-eco-600/40 text-eco-100 border border-eco-600'
                    : 'bg-gray-700/40 text-gray-200 border border-gray-600/30'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {/* Scenario Breakdown Card */}
                {message.scenario && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-gray-600/30 space-y-2"
                  >
                    <div className="text-xs font-semibold text-amber-300">Impact Summary:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-gray-400">Original</div>
                        <div className="text-eco-300 font-bold">
                          {message.scenario.originalEmissions.toFixed(0)} kg
                        </div>
                      </div>
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-gray-400">Preview</div>
                        <div className="text-amber-300 font-bold">
                          {message.scenario.previewEmissions.toFixed(0)} kg
                        </div>
                      </div>
                    </div>
                    <div
                      className={`rounded p-2 text-xs font-semibold text-center ${
                        message.scenario.percentChange > 0
                          ? 'bg-red-900/30 text-red-300'
                          : 'bg-green-900/30 text-green-300'
                      }`}
                    >
                      {message.scenario.percentChange > 0 ? '+' : ''}
                      {message.scenario.percentChange.toFixed(1)}% CO₂e
                    </div>
                    {message.scenario.affectedRoutes.length > 0 && (
                      <div className="mt-2">
                        <div className="text-gray-400 text-xs mb-1">Affected Routes:</div>
                        <div className="space-y-1">
                          {message.scenario.affectedRoutes.slice(0, 2).map((route, idx) => (
                            <div key={idx} className="text-xs text-gray-300 bg-black/20 p-1 rounded">
                              • {route}
                            </div>
                          ))}
                          {message.scenario.affectedRoutes.length > 2 && (
                            <div className="text-xs text-gray-400 italic">
                              +{message.scenario.affectedRoutes.length - 2} more routes
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/30">
              <div className="flex gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-2 h-2 bg-eco-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                  className="w-2 h-2 bg-eco-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-eco-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInterface onSendMessage={handleUserMessage} isLoading={isLoading} />
    </div>
  )
}

// Helper functions
async function detectAndCalculateScenario(
  userInput: string,
  logs: any[]
): Promise<ScenarioResult | null> {
  const input = userInput.toLowerCase()

  // What-If pattern detection
  const whatIfPatterns = [
    /what if|switch.*to|change.*to|replace.*with|convert.*to/gi,
    /all.*air|all.*sea|all.*land/gi,
    /eliminate|reduce|improve/gi,
  ]

  const isWhatIf = whatIfPatterns.some((pattern) => pattern.test(input))

  if (!isWhatIf) return null

  try {
    // Parse scenario intent
    let targetTransport: 'air' | 'sea' | 'land' | null = null
    let sourceTransport: 'air' | 'sea' | 'land' | 'all' | null = null

    if (input.includes('air')) sourceTransport = 'air'
    if (input.includes('sea') && !input.includes('sea to')) targetTransport = 'sea'
    if (input.includes('land')) {
      if (input.includes('to land')) targetTransport = 'land'
      else sourceTransport = 'land'
    }

    // Extract route references
    const routeMatch = input.match(/route\s+(\w+)|shipment\s+(\w+)/i)
    const routeId = routeMatch?.[1] || routeMatch?.[2]

    // Calculate impact
    const scenario = await calculateScenarioImpact(
      logs,
      sourceTransport,
      targetTransport,
      routeId
    )

    return scenario
  } catch (error) {
    console.error('Scenario calculation error:', error)
    return null
  }
}

function buildScenarioResponse(scenario: ScenarioResult, userInput: string): string {
  const isReduction = scenario.percentChange <= 0
  const emoji = isReduction ? '✅' : '❌'
  const action = isReduction ? 'reduce' : 'increase'

  return `${emoji} **Scenario Analysis Complete**

📊 **Impact Assessment:**
• Current Emissions: ${scenario.originalEmissions.toFixed(0)} kg CO₂e
• Projected Emissions: ${scenario.previewEmissions.toFixed(0)} kg CO₂e
• Change: ${scenario.percentChange > 0 ? '+' : ''}${scenario.percentChange.toFixed(1)}% (${scenario.delta.toFixed(0)} kg CO₂e)

🎯 **Routes Affected:** ${scenario.affectedRoutes.length} shipment${scenario.affectedRoutes.length !== 1 ? 's' : ''}

💡 **Recommendation:**
${scenario.recommendation}

📈 **Forest Health Score:** ${scenario.previewScore.toFixed(1)}/100
${isReduction ? '🌱 The digital forest would grow healthier!' : '🍂 The forest health would decline.'}

Would you like me to:
1. Explore other transport alternatives?
2. Analyze which routes would benefit most from this change?
3. Calculate multi-step optimizations?`
}

function buildGeneralResponse(
  userInput: string,
  supplyChainData: any,
  carbonData: any,
  logs: any[]
): string {
  const input = userInput.toLowerCase()

  // Carbon overview
  if (
    input.includes('how much') ||
    input.includes('total') ||
    input.includes('overview') ||
    input.includes('breakdown')
  ) {
    if (!carbonData?.aggregates) {
      return '📊 I need more data to provide comprehensive analytics. Please try again in a moment.'
    }

    const air = carbonData.aggregates.by_transport_type.air || 0
    const sea = carbonData.aggregates.by_transport_type.sea || 0
    const land = carbonData.aggregates.by_transport_type.land || 0
    const total = carbonData.aggregates.total_kg_co2e

    return `📊 **Your Supply Chain Carbon Footprint**

🌍 **Emissions Breakdown:**
• ✈️ Air Transport: ${air.toFixed(0)} kg CO₂e (${((air / total) * 100).toFixed(1)}%)
• 🚢 Sea Transport: ${sea.toFixed(0)} kg CO₂e (${((sea / total) * 100).toFixed(1)}%)
• 🚛 Land Transport: ${land.toFixed(0)} kg CO₂e (${((land / total) * 100).toFixed(1)}%)

📈 **Total Emissions:** ${total.toFixed(0)} kg CO₂e
📦 **Average per Shipment:** ${carbonData.aggregates.average_per_shipment_kg_co2e.toFixed(0)} kg CO₂e

🔍 **Key Insight:** ${
      air > sea * 20
        ? 'Air transport is your biggest contributor. Shifting routes to sea could yield massive reductions.'
        : 'Your supply chain is relatively balanced. Focus on the high-impact routes.'
    }

Try asking me: "What if we switched all air shipments to sea?" or "Which routes should we optimize?"`;
  }

  // Recommendations
  if (input.includes('recommend') || input.includes('improve') || input.includes('action')) {
    return `💡 **Sustainability Recommendations**

🎯 **Quick Wins:**
1. **Consolidate shipments** - Combine multiple small air shipments into one sea route
2. **Optimize routing** - Identify detours that add unnecessary distance
3. **Partner with eco-carriers** - Use low-emission shipping providers

📊 **High-Impact Changes:**
• Switch just 2 air routes to sea: ~500 kg CO₂e reduction monthly
• Use regional land distribution hubs: ~200 kg CO₂e reduction
• Bundle overseas shipments: ~300 kg CO₂e reduction

💰 **Business Benefits:**
✓ 20-30% cost savings with sea transport
✓ Improved brand reputation with sustainability reports
✓ Compliance with emerging carbon regulations

Ask me: "What if we consolidated SC002 with another shipment?" to explore specific scenarios!`
  }

  // Default helpful response
  return `🤔 I understand you're asking about "${userInput}". 

Here's what I can help you with:

📊 **Data Analysis:**
"How much CO₂ are we emitting?"
"Break down emissions by transport type"
"Which routes are the worst offenders?"

🔄 **Scenario Planning:**
"What if we switched SC001 from air to sea?"
"Show me the impact of optimizing all land routes"
"What if we consolidated our shipments?"

💡 **Strategic Advice:**
"What recommendations do you have?"
"How can we improve our sustainability?"
"What's our biggest opportunity?"

Let me know how I can help! 🌱`
}
