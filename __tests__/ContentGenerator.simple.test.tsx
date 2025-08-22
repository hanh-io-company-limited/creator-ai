import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContentGenerator from '../components/ContentGenerator'
import { generateContent } from '../lib/ai-service'

// Mock the AI service
jest.mock('../lib/ai-service', () => ({
  generateContent: jest.fn(),
}))

const mockGenerateContent = generateContent as jest.MockedFunction<typeof generateContent>

describe('ContentGenerator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form elements and buttons correctly', () => {
    render(<ContentGenerator />)
    
    expect(screen.getByText('Content Generator')).toBeInTheDocument()
    expect(screen.getByTestId('prompt-input')).toBeInTheDocument()
    expect(screen.getByTestId('generate-button')).toBeInTheDocument()
    expect(screen.getByTestId('clear-button')).toBeInTheDocument()
  })

  it('disables generate button when prompt is empty', () => {
    render(<ContentGenerator />)
    
    const generateButton = screen.getByTestId('generate-button')
    expect(generateButton).toBeDisabled()
  })

  it('enables generate button when prompt has content', () => {
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    expect(generateButton).not.toBeDisabled()
  })

  it('successfully generates content and displays result', async () => {
    const mockContent = 'Generated content from AI'
    mockGenerateContent.mockResolvedValue(mockContent)
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    fireEvent.change(promptInput, { target: { value: 'Create a story about AI' } })
    fireEvent.click(generateButton)
    
    // Check loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    
    // Wait for generation to complete
    await waitFor(() => {
      expect(screen.getByTestId('result-container')).toBeInTheDocument()
      expect(screen.getByText(mockContent)).toBeInTheDocument()
    })
  })

  it('handles generation errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'))
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('Failed to generate content. Please try again.')).toBeInTheDocument()
    })
  })

  it('clears form and results when clear button is clicked', async () => {
    const mockContent = 'Generated content'
    mockGenerateContent.mockResolvedValue(mockContent)
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    const clearButton = screen.getByTestId('clear-button')
    
    // Generate content first
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('result-container')).toBeInTheDocument()
    })
    
    // Clear everything
    fireEvent.click(clearButton)
    
    expect(promptInput).toHaveValue('')
    expect(screen.queryByTestId('result-container')).not.toBeInTheDocument()
  })
})