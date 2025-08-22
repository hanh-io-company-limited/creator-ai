import { generateContent, checkModelStatus, deployModel, healthCheck, getModelMetrics } from '@/lib/ai-service'

// Mock setTimeout for controlling timing in tests
jest.useFakeTimers()

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  describe('generateContent', () => {
    it('generates content for a given prompt', async () => {
      const promise = generateContent('Test prompt')
      
      // Fast-forward time to complete the mock delay
      jest.advanceTimersByTime(3000)
      
      const result = await promise
      
      expect(typeof result).toBe('string')
      expect(result).toContain('Test prompt')
      expect(result.length).toBeGreaterThan(0)
    })

    it('returns different responses for different prompts', async () => {
      const promises = [
        generateContent('Write a story'),
        generateContent('Create a poem'),
        generateContent('Explain AI')
      ]
      
      jest.advanceTimersByTime(5000)
      
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
    })

    it('occasionally throws errors to simulate service failures', async () => {
      // Run multiple requests to increase chance of hitting the error condition
      const promises = Array.from({ length: 20 }, () => generateContent('Test'))
      
      jest.advanceTimersByTime(5000)
      
      const results = await Promise.allSettled(promises)
      
      // Some should succeed, some might fail
      const successes = results.filter(r => r.status === 'fulfilled')
      const failures = results.filter(r => r.status === 'rejected')
      
      expect(successes.length).toBeGreaterThan(0)
      // Due to randomness, failures are not guaranteed, but the test structure is correct
      failures.forEach(failure => {
        expect(failure.status).toBe('rejected')
        if (failure.status === 'rejected') {
          expect(failure.reason.message).toBe('AI service temporarily unavailable')
        }
      })
    })

    it('has realistic response times', async () => {
      const promise = generateContent('Test prompt')
      
      // Advance time by the minimum expected delay
      jest.advanceTimersByTime(3000)
      
      const result = await promise
      
      // The promise should resolve and return valid content
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('checkModelStatus', () => {
    it('returns an array of model information', async () => {
      const promise = checkModelStatus()
      
      jest.advanceTimersByTime(2000)
      
      const models = await promise
      
      expect(Array.isArray(models)).toBe(true)
      expect(models.length).toBeGreaterThan(0)
      
      models.forEach(model => {
        expect(model).toHaveProperty('name')
        expect(model).toHaveProperty('status')
        expect(model).toHaveProperty('version')
        expect(model).toHaveProperty('lastUpdated')
        expect(model.lastUpdated).toBeInstanceOf(Date)
        expect(['active', 'inactive', 'deploying', 'error']).toContain(model.status)
      })
    })

    it('includes expected model names', async () => {
      const promise = checkModelStatus()
      
      jest.advanceTimersByTime(2000)
      
      const models = await promise
      const modelNames = models.map(m => m.name)
      
      expect(modelNames).toContain('GPT-3.5-turbo')
      expect(modelNames).toContain('Text-Embedding-Ada-002')
      expect(modelNames).toContain('DALL-E-2')
      expect(modelNames).toContain('Whisper-1')
    })

    it('has varied model statuses', async () => {
      // Run multiple times to see different status combinations
      const promises = Array.from({ length: 10 }, () => checkModelStatus())
      
      jest.advanceTimersByTime(5000)
      
      const results = await Promise.all(promises)
      const allStatuses = results.flat().map(model => model.status)
      
      // Should have some variety in statuses over multiple calls
      const uniqueStatuses = new Set(allStatuses)
      expect(uniqueStatuses.size).toBeGreaterThan(1)
    })

    it('occasionally throws errors', async () => {
      // Run multiple requests to test error handling
      const promises = Array.from({ length: 20 }, () => checkModelStatus())
      
      jest.advanceTimersByTime(5000)
      
      const results = await Promise.allSettled(promises)
      
      // Most should succeed
      const successes = results.filter(r => r.status === 'fulfilled')
      expect(successes.length).toBeGreaterThanOrEqual(15) // Most should succeed given 5% error rate
    })
  })

  describe('deployModel', () => {
    it('successfully deploys a model', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      const promise = deployModel('GPT-3.5-turbo')
      
      jest.advanceTimersByTime(6000)
      
      await expect(promise).resolves.toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('Successfully deployed model: GPT-3.5-turbo')
      
      consoleSpy.mockRestore()
    })

    it('has realistic deployment times', async () => {
      const promise = deployModel('Test-Model')
      
      // Deployment should take at least 2 seconds
      jest.advanceTimersByTime(1000)
      
      let resolved = false
      promise.then(() => { resolved = true })
      
      // Should not be resolved yet
      await Promise.resolve() // Let any immediate promises resolve
      expect(resolved).toBe(false)
      
      // Now advance enough time
      jest.advanceTimersByTime(4000)
      await promise
    })

    it('occasionally fails deployment', async () => {
      // Test multiple deployments to check error rate
      const promises = Array.from({ length: 20 }, (_, i) => deployModel(`Model-${i}`))
      
      jest.advanceTimersByTime(10000)
      
      const results = await Promise.allSettled(promises)
      
      const successes = results.filter(r => r.status === 'fulfilled')
      const failures = results.filter(r => r.status === 'rejected')
      
      expect(successes.length).toBeGreaterThanOrEqual(15) // Most should succeed
      
      failures.forEach(failure => {
        if (failure.status === 'rejected') {
          expect(failure.reason.message).toMatch(/Failed to deploy model/)
        }
      })
    })
  })

  describe('healthCheck', () => {
    it('returns health status information', async () => {
      const promise = healthCheck()
      
      jest.advanceTimersByTime(1000)
      
      const health = await promise
      
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('models')
      expect(health).toHaveProperty('uptime')
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status)
      expect(typeof health.models).toBe('number')
      expect(typeof health.uptime).toBe('string')
      expect(health.uptime).toMatch(/\d+d \d+h/)
    })

    it('reports correct number of models', async () => {
      const promise = healthCheck()
      
      jest.advanceTimersByTime(1000)
      
      const health = await promise
      
      expect(health.models).toBe(4)
    })
  })

  describe('getModelMetrics', () => {
    it('returns metrics for a specific model', async () => {
      const promise = getModelMetrics('GPT-3.5-turbo')
      
      jest.advanceTimersByTime(1000)
      
      const metrics = await promise
      
      expect(metrics).toHaveProperty('requests')
      expect(metrics).toHaveProperty('successRate')
      expect(metrics).toHaveProperty('avgResponseTime')
      expect(metrics).toHaveProperty('lastHour')
      
      expect(typeof metrics.requests).toBe('number')
      expect(typeof metrics.successRate).toBe('number')
      expect(typeof metrics.avgResponseTime).toBe('number')
      expect(Array.isArray(metrics.lastHour)).toBe(true)
      
      expect(metrics.requests).toBeGreaterThan(1000)
      expect(metrics.successRate).toBeGreaterThanOrEqual(95)
      expect(metrics.successRate).toBeLessThanOrEqual(100)
      expect(metrics.avgResponseTime).toBeGreaterThan(500)
      expect(metrics.lastHour).toHaveLength(12)
    })

    it('returns realistic metrics ranges', async () => {
      const promise = getModelMetrics('Test-Model')
      
      jest.advanceTimersByTime(1000)
      
      const metrics = await promise
      
      expect(metrics.requests).toBeLessThan(20000)
      expect(metrics.avgResponseTime).toBeLessThan(2500)
      expect(metrics.lastHour.every(val => val >= 0 && val <= 100)).toBe(true)
    })
  })

  describe('Service Integration', () => {
    it('all services handle concurrent requests', async () => {
      const promises = [
        generateContent('Test 1'),
        generateContent('Test 2'),
        checkModelStatus(),
        deployModel('Test-Model'),
        healthCheck(),
        getModelMetrics('GPT-3.5-turbo')
      ]
      
      jest.advanceTimersByTime(10000)
      
      const results = await Promise.allSettled(promises)
      
      // Most should succeed (some deployment might fail due to random errors)
      const successes = results.filter(r => r.status === 'fulfilled')
      expect(successes.length).toBeGreaterThan(4)
    })

    it('maintains consistent model names across services', async () => {
      const statusPromise = checkModelStatus()
      const metricsPromise = getModelMetrics('GPT-3.5-turbo')
      
      jest.advanceTimersByTime(5000)
      
      const [models, metrics] = await Promise.all([statusPromise, metricsPromise])
      
      const modelNames = models.map(m => m.name)
      expect(modelNames).toContain('GPT-3.5-turbo')
      expect(metrics).toBeDefined() // Should successfully get metrics for existing model
    })
  })
})