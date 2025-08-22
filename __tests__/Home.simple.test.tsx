import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../app/page'

// Mock the AI service
jest.mock('../lib/ai-service', () => ({
  generateContent: jest.fn(),
  checkModelStatus: jest.fn(),
  deployModel: jest.fn(),
}))

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the home page with navigation buttons', () => {
    render(<Home />)
    
    expect(screen.getByText('Creator AI')).toBeInTheDocument()
    expect(screen.getByText('AI-powered content creation platform')).toBeInTheDocument()
    expect(screen.getByTestId('generate-tab')).toBeInTheDocument()
    expect(screen.getByTestId('status-tab')).toBeInTheDocument()
  })

  it('switches between tabs when navigation buttons are clicked', async () => {
    render(<Home />)
    
    // Initially on generate tab
    expect(screen.getByText('Content Generator')).toBeInTheDocument()
    
    // Click status tab
    fireEvent.click(screen.getByTestId('status-tab'))
    
    await waitFor(() => {
      expect(screen.getByText('Model Status')).toBeInTheDocument()
    })
    
    // Click generate tab again
    fireEvent.click(screen.getByTestId('generate-tab'))
    
    await waitFor(() => {
      expect(screen.getByText('Content Generator')).toBeInTheDocument()
    })
  })

  it('applies correct CSS classes to active and inactive tab buttons', () => {
    render(<Home />)
    
    const generateTab = screen.getByTestId('generate-tab')
    const statusTab = screen.getByTestId('status-tab')
    
    // Initially generate tab is active
    expect(generateTab).toHaveClass('btn')
    expect(generateTab).not.toHaveClass('btn-secondary')
    expect(statusTab).toHaveClass('btn-secondary')
    
    // Switch to status tab
    fireEvent.click(statusTab)
    
    expect(statusTab).toHaveClass('btn')
    expect(statusTab).not.toHaveClass('btn-secondary')
    expect(generateTab).toHaveClass('btn-secondary')
  })
})