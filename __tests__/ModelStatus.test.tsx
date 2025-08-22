import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModelStatus from '../components/ModelStatus'
import { checkModelStatus, deployModel } from '../lib/ai-service'

// Mock the AI service
jest.mock('../lib/ai-service', () => ({
  checkModelStatus: jest.fn(),
  deployModel: jest.fn(),
}))

const mockCheckModelStatus = checkModelStatus as jest.MockedFunction<typeof checkModelStatus>
const mockDeployModel = deployModel as jest.MockedFunction<typeof deployModel>

const mockModels = [
  {
    name: 'GPT-3.5-turbo',
    status: 'active' as const,
    version: '1.0.0',
    lastUpdated: new Date('2024-01-01T12:00:00Z')
  },
  {
    name: 'Text-Embedding-Ada-002',
    status: 'inactive' as const,
    version: '1.0.0',
    lastUpdated: new Date('2024-01-01T10:00:00Z')
  },
  {
    name: 'DALL-E-2',
    status: 'error' as const,
    version: '2.0.0',
    lastUpdated: new Date('2024-01-01T08:00:00Z')
  }
]

describe('ModelStatus Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckModelStatus.mockResolvedValue(mockModels)
  })

  it('renders loading state initially', () => {
    render(<ModelStatus />)
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    expect(screen.getByText('Loading model status...')).toBeInTheDocument()
  })

  it('renders all models after loading', async () => {
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('Model Status')).toBeInTheDocument()
      expect(screen.getByTestId('models-list')).toBeInTheDocument()
    })
    
    // Check all models are displayed
    expect(screen.getByText('GPT-3.5-turbo')).toBeInTheDocument()
    expect(screen.getByText('Text-Embedding-Ada-002')).toBeInTheDocument()
    expect(screen.getByText('DALL-E-2')).toBeInTheDocument()
  })

  it('displays correct status indicators for each model', async () => {
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('status-gpt-3-5-turbo')).toHaveTextContent('Active')
      expect(screen.getByTestId('status-text-embedding-ada-002')).toHaveTextContent('Inactive')
      expect(screen.getByTestId('status-dall-e-2')).toHaveTextContent('Error')
    })
  })

  it('shows deploy button for inactive models', async () => {
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('deploy-text-embedding-ada-002')).toBeInTheDocument()
      expect(screen.getByTestId('deploy-text-embedding-ada-002')).toHaveTextContent('Deploy')
    })
    
    // Active models should not have deploy button
    expect(screen.queryByTestId('deploy-gpt-3-5-turbo')).not.toBeInTheDocument()
  })

  it('shows redeploy button for error models', async () => {
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('redeploy-dall-e-2')).toBeInTheDocument()
      expect(screen.getByTestId('redeploy-dall-e-2')).toHaveTextContent('Redeploy')
    })
  })

  it('refreshes model status when refresh button is clicked', async () => {
    const user = userEvent.setup()
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
    })
    
    // Reset the mock to track calls
    mockCheckModelStatus.mockClear()
    
    await user.click(screen.getByTestId('refresh-button'))
    
    expect(mockCheckModelStatus).toHaveBeenCalledTimes(1)
  })

  it('successfully deploys an inactive model', async () => {
    const user = userEvent.setup()
    mockDeployModel.mockResolvedValue()
    
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('deploy-text-embedding-ada-002')).toBeInTheDocument()
    })
    
    const deployButton = screen.getByTestId('deploy-text-embedding-ada-002')
    await user.click(deployButton)
    
    // Check loading state
    expect(screen.getByText('Deploying...')).toBeInTheDocument()
    expect(deployButton).toBeDisabled()
    
    // Wait for deployment to complete
    await waitFor(() => {
      expect(mockDeployModel).toHaveBeenCalledWith('Text-Embedding-Ada-002')
    })
    
    // Check that status updates to active
    await waitFor(() => {
      expect(screen.getByTestId('status-text-embedding-ada-002')).toHaveTextContent('Active')
    })
  })

  it('handles deployment errors gracefully', async () => {
    const user = userEvent.setup()
    mockDeployModel.mockRejectedValue(new Error('Deployment failed'))
    
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('deploy-text-embedding-ada-002')).toBeInTheDocument()
    })
    
    const deployButton = screen.getByTestId('deploy-text-embedding-ada-002')
    await user.click(deployButton)
    
    // Wait for deployment to fail
    await waitFor(() => {
      expect(mockDeployModel).toHaveBeenCalledWith('Text-Embedding-Ada-002')
    })
    
    // Check that status updates to error
    await waitFor(() => {
      expect(screen.getByTestId('status-text-embedding-ada-002')).toHaveTextContent('Error')
    })
  })

  it('redeploys an error model', async () => {
    const user = userEvent.setup()
    mockDeployModel.mockResolvedValue()
    
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('redeploy-dall-e-2')).toBeInTheDocument()
    })
    
    const redeployButton = screen.getByTestId('redeploy-dall-e-2')
    await user.click(redeployButton)
    
    // Check loading state
    expect(screen.getByText('Deploying...')).toBeInTheDocument()
    expect(redeployButton).toBeDisabled()
    
    await waitFor(() => {
      expect(mockDeployModel).toHaveBeenCalledWith('DALL-E-2')
    })
    
    // Check that status updates to active
    await waitFor(() => {
      expect(screen.getByTestId('status-dall-e-2')).toHaveTextContent('Active')
    })
  })

  it('handles multiple concurrent deployments', async () => {
    const user = userEvent.setup()
    mockDeployModel.mockImplementation((modelName) => 
      new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    // Add another inactive model to the mock data
    const modelsWithMultipleInactive = [
      ...mockModels,
      {
        name: 'Whisper-1',
        status: 'inactive' as const,
        version: '1.0.0',
        lastUpdated: new Date('2024-01-01T09:00:00Z')
      }
    ]
    
    mockCheckModelStatus.mockResolvedValue(modelsWithMultipleInactive)
    
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('deploy-text-embedding-ada-002')).toBeInTheDocument()
      expect(screen.getByTestId('deploy-whisper-1')).toBeInTheDocument()
    })
    
    // Click both deploy buttons quickly
    await user.click(screen.getByTestId('deploy-text-embedding-ada-002'))
    await user.click(screen.getByTestId('deploy-whisper-1'))
    
    // Both should show deploying state
    expect(screen.getAllByText('Deploying...')).toHaveLength(2)
  })

  it('displays model version and last updated information', async () => {
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/Version: 1\.0\.0/)).toBeInTheDocument()
      expect(screen.getByText(/Version: 2\.0\.0/)).toBeInTheDocument()
      expect(screen.getByText(/Last Updated:/)).toBeInTheDocument()
    })
  })

  it('handles API errors when fetching model status', async () => {
    mockCheckModelStatus.mockRejectedValue(new Error('API Error'))
    
    render(<ModelStatus />)
    
    // Should still show default models even if API fails
    await waitFor(() => {
      expect(screen.getByText('GPT-3.5-turbo')).toBeInTheDocument()
      expect(screen.getByText('Text-Embedding-Ada-002')).toBeInTheDocument()
      expect(screen.getByText('DALL-E-2')).toBeInTheDocument()
    })
  })

  it('maintains proper accessibility with keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<ModelStatus />)
    
    await waitFor(() => {
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
    })
    
    // Tab to refresh button
    await user.tab()
    expect(screen.getByTestId('refresh-button')).toHaveFocus()
    
    // Tab to deploy button
    await user.tab()
    expect(screen.getByTestId('deploy-text-embedding-ada-002')).toHaveFocus()
    
    // Enter key should trigger deployment
    await user.keyboard('{Enter}')
    expect(mockDeployModel).toHaveBeenCalledWith('Text-Embedding-Ada-002')
  })
})