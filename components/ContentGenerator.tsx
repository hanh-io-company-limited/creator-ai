'use client'

import { useState } from 'react'
import { generateContent } from '../lib/ai-service'

interface GenerationResult {
  content: string
  model: string
  timestamp: Date
}

export default function ContentGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const content = await generateContent(prompt)
      setResult({
        content,
        model: 'GPT-3.5-turbo',
        timestamp: new Date()
      })
    } catch (err) {
      setError('Failed to generate content. Please try again.')
      console.error('Generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt('')
    setResult(null)
    setError('')
  }

  const handleCopy = async () => {
    if (result?.content) {
      try {
        await navigator.clipboard.writeText(result.content)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  return (
    <div className="card">
      <h2>Content Generator</h2>
      
      <div className="form-group">
        <label htmlFor="prompt">Enter your prompt:</label>
        <textarea
          id="prompt"
          data-testid="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to create..."
          rows={4}
          disabled={isLoading}
        />
        {error && <div className="error" data-testid="error-message">{error}</div>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          data-testid="generate-button"
          className="btn"
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Generating...' : 'Generate Content'}
        </button>
        
        <button
          data-testid="clear-button"
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={isLoading}
        >
          Clear
        </button>
      </div>

      {result && (
        <div className="card" data-testid="result-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Generated Content</h3>
            <button
              data-testid="copy-button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ padding: '6px 12px', fontSize: '14px' }}
            >
              Copy
            </button>
          </div>
          
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: '1rem' }}>
            {result.content}
          </div>
          
          <div style={{ fontSize: '12px', color: '#666' }}>
            Model: {result.model} | Generated: {result.timestamp.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}