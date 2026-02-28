'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatInterface({ onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const defaultSuggestions = [
    'What if we switched SC001 to sea transport?',
    'Show me our carbon footprint breakdown',
    'Which routes should we optimize?',
    'What are your top recommendations?',
    'What if we consolidated all air shipments?',
  ]

  useEffect(() => {
    if (input.length > 0) {
      // Filter suggestions based on input
      const filtered = defaultSuggestions.filter((s) =>
        s.toLowerCase().includes(input.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [input])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput('')
      setShowSuggestions(false)
      inputRef.current?.focus()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion)
    setInput('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-700 bg-gray-900/50 p-4 space-y-3">
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
        >
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-eco-600/20 transition-colors border-b border-gray-700/50 last:border-0"
            >
              💬 {suggestion}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(input.length > 0)}
            placeholder="Ask about your supply chain... (Shift+Enter for new line)"
            disabled={isLoading}
            rows={1}
            className="w-full px-4 py-2 bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg focus:border-eco-500 focus:outline-none focus:ring-1 focus:ring-eco-500/50 resize-none disabled:opacity-50"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-gradient-to-r from-eco-600 to-eco-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-eco-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Thinking...
            </>
          ) : (
            <>
              Send
              <span>→</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        💡 Tip: Ask about current emissions, explore what-if scenarios, or request recommendations
      </p>
    </div>
  )
}
