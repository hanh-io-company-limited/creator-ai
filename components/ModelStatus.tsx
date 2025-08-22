'use client'

import { useState, useEffect } from 'react'
import { checkModelStatus, deployModel } from '../lib/ai-service'

interface ModelInfo {
  name: string
  status: 'active' | 'inactive' | 'deploying' | 'error'
  version: string
  lastUpdated: Date
}

export default function ModelStatus() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deployingModels, setDeployingModels] = useState<Set<string>>(new Set())

  const fetchModelStatus = async () => {
    setIsLoading(true)
    try {
      const modelData = await checkModelStatus()
      setModels(modelData)
    } catch (error) {
      console.error('Failed to fetch model status:', error)
      // Set default models for demonstration
      setModels([
        {
          name: 'GPT-3.5-turbo',
          status: 'active',
          version: '1.0.0',
          lastUpdated: new Date()
        },
        {
          name: 'Text-Embedding-Ada-002',
          status: 'inactive',
          version: '1.0.0',
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          name: 'DALL-E-2',
          status: 'active',
          version: '2.0.0',
          lastUpdated: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeploy = async (modelName: string) => {
    setDeployingModels(prev => new Set(prev).add(modelName))
    
    try {
      await deployModel(modelName)
      // Update the model status after deployment
      setModels(prev => prev.map(model => 
        model.name === modelName 
          ? { ...model, status: 'active' as const, lastUpdated: new Date() }
          : model
      ))
    } catch (error) {
      console.error(`Failed to deploy model ${modelName}:`, error)
      // Update status to error
      setModels(prev => prev.map(model => 
        model.name === modelName 
          ? { ...model, status: 'error' as const }
          : model
      ))
    } finally {
      setDeployingModels(prev => {
        const newSet = new Set(prev)
        newSet.delete(modelName)
        return newSet
      })
    }
  }

  const handleRefresh = () => {
    fetchModelStatus()
  }

  useEffect(() => {
    fetchModelStatus()
  }, [])

  const getStatusColor = (status: ModelInfo['status']) => {
    switch (status) {
      case 'active': return '#28a745'
      case 'inactive': return '#6c757d'
      case 'deploying': return '#ffc107'
      case 'error': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status: ModelInfo['status']) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Inactive'
      case 'deploying': return 'Deploying'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <h2>Model Status</h2>
        <div data-testid="loading-indicator">Loading model status...</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Model Status</h2>
        <button
          data-testid="refresh-button"
          className="btn btn-secondary"
          onClick={handleRefresh}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          Refresh
        </button>
      </div>

      <div data-testid="models-list">
        {models.map((model) => (
          <div key={model.name} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{model.name}</h3>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Version: {model.version} | Last Updated: {model.lastUpdated.toLocaleString()}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(model.status)
                    }}
                  />
                  <span data-testid={`status-${model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                    {getStatusText(model.status)}
                  </span>
                </div>
                
                {model.status === 'inactive' && (
                  <button
                    data-testid={`deploy-${model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="btn"
                    onClick={() => handleDeploy(model.name)}
                    disabled={deployingModels.has(model.name)}
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                  >
                    {deployingModels.has(model.name) ? 'Deploying...' : 'Deploy'}
                  </button>
                )}
                
                {model.status === 'error' && (
                  <button
                    data-testid={`redeploy-${model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="btn btn-danger"
                    onClick={() => handleDeploy(model.name)}
                    disabled={deployingModels.has(model.name)}
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                  >
                    {deployingModels.has(model.name) ? 'Deploying...' : 'Redeploy'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}