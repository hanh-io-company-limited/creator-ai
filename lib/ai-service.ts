// Mock AI service for content generation and model management
// In a real application, this would interface with actual AI APIs

interface ModelInfo {
  name: string
  status: 'active' | 'inactive' | 'deploying' | 'error'
  version: string
  lastUpdated: Date
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock content generation
export async function generateContent(prompt: string): Promise<string> {
  await delay(1000 + Math.random() * 2000) // Simulate API call time
  
  // Simulate occasional failures (reduced for testing)
  if (Math.random() < 0.01) {
    throw new Error('AI service temporarily unavailable')
  }
  
  // Generate mock content based on prompt
  const mockResponses = [
    `Based on your prompt "${prompt}", here's some creative content:\n\nThis is an AI-generated response that demonstrates the content creation capabilities of the Creator AI platform. The content is tailored to your specific request and showcases various writing styles and approaches.`,
    
    `Here's your generated content for "${prompt}":\n\nThe Creator AI platform leverages advanced machine learning models to produce high-quality, contextually relevant content. This response demonstrates the system's ability to understand and respond to user prompts effectively.`,
    
    `Generated content for "${prompt}":\n\nOur AI-powered content generation system has analyzed your request and produced this tailored response. The platform combines multiple language models to ensure quality, relevance, and creativity in every generated piece.`
  ]
  
  return mockResponses[Math.floor(Math.random() * mockResponses.length)]
}

// Mock model status checking
export async function checkModelStatus(): Promise<ModelInfo[]> {
  await delay(500 + Math.random() * 1000) // Simulate API call time
  
  // Simulate occasional failures (reduced for testing)
  if (Math.random() < 0.01) {
    throw new Error('Failed to fetch model status')
  }
  
  const models: ModelInfo[] = [
    {
      name: 'GPT-3.5-turbo',
      status: Math.random() > 0.8 ? 'inactive' : 'active',
      version: '1.0.0',
      lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Text-Embedding-Ada-002',
      status: Math.random() > 0.6 ? 'inactive' : 'active',
      version: '1.0.0',
      lastUpdated: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000)
    },
    {
      name: 'DALL-E-2',
      status: Math.random() > 0.7 ? 'inactive' : 'active',
      version: '2.0.0',
      lastUpdated: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000)
    },
    {
      name: 'Whisper-1',
      status: Math.random() > 0.9 ? 'error' : (Math.random() > 0.5 ? 'inactive' : 'active'),
      version: '1.0.0',
      lastUpdated: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000)
    }
  ]
  
  return models
}

// Mock model deployment
export async function deployModel(modelName: string): Promise<void> {
  await delay(2000 + Math.random() * 3000) // Simulate deployment time
  
  // Simulate occasional deployment failures (reduced for testing)
  if (Math.random() < 0.05) {
    throw new Error(`Failed to deploy model ${modelName}`)
  }
  
  console.log(`Successfully deployed model: ${modelName}`)
}

// Health check for the AI service
export async function healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy', models: number, uptime: string }> {
  await delay(200 + Math.random() * 300)
  
  const uptimeHours = Math.floor(Math.random() * 720) + 1 // 1-720 hours
  const status = Math.random() > 0.9 ? 'degraded' : 'healthy'
  
  return {
    status,
    models: 4,
    uptime: `${Math.floor(uptimeHours / 24)}d ${uptimeHours % 24}h`
  }
}

// Get model metrics
export async function getModelMetrics(modelName: string): Promise<{
  requests: number
  successRate: number
  avgResponseTime: number
  lastHour: number[]
}> {
  await delay(300 + Math.random() * 500)
  
  return {
    requests: Math.floor(Math.random() * 10000) + 1000,
    successRate: 95 + Math.random() * 5, // 95-100%
    avgResponseTime: 500 + Math.random() * 1500, // 500-2000ms
    lastHour: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
  }
}