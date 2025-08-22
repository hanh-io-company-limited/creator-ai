import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    expect(screen.getByText('Generate Content')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('disables generate button when prompt is empty', () => {
    render(<ContentGenerator />)
    
    const generateButton = screen.getByTestId('generate-button')
    expect(generateButton).toBeDisabled()
  })

  it('enables generate button when prompt has content', async () => {
    const user = userEvent.setup()
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    await user.type(promptInput, 'Test prompt')
    
    expect(generateButton).not.toBeDisabled()
  })

  it('shows error message for empty prompt submission', async () => {
    const user = userEvent.setup()
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    // Type and then clear the input to trigger empty state
    await user.type(promptInput, 'test')
    await user.clear(promptInput)
    
    // Force click the button (even though it should be disabled)
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('Please enter a prompt')).toBeInTheDocument()
    })
  })

  it('successfully generates content and displays result', async () => {
    const user = userEvent.setup()
    const mockContent = 'Generated content from AI'
    mockGenerateContent.mockResolvedValue(mockContent)
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    await user.type(promptInput, 'Create a story about AI')
    await user.click(generateButton)
    
    // Check loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(generateButton).toBeDisabled()
    
    // Wait for generation to complete
    await waitFor(() => {
      expect(screen.getByTestId('result-container')).toBeInTheDocument()
      expect(screen.getByText(mockContent)).toBeInTheDocument()
      expect(screen.getByText('Generated Content')).toBeInTheDocument()
    })
    
    // Check that loading state is cleared
    expect(screen.getByText('Generate Content')).toBeInTheDocument()
    expect(generateButton).not.toBeDisabled()
  })

  it('handles generation errors gracefully', async () => {
    const user = userEvent.setup()
    mockGenerateContent.mockRejectedValue(new Error('API Error'))
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    await user.type(promptInput, 'Test prompt')
    await user.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('Failed to generate content. Please try again.')).toBeInTheDocument()
    })
    
    // Ensure loading state is cleared
    expect(screen.getByText('Generate Content')).toBeInTheDocument()
    expect(generateButton).not.toBeDisabled()
  })

  it('clears form and results when clear button is clicked', async () => {
    const user = userEvent.setup()
    const mockContent = 'Generated content'
    mockGenerateContent.mockResolvedValue(mockContent)
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    const clearButton = screen.getByTestId('clear-button')
    
    // Generate content first
    await user.type(promptInput, 'Test prompt')
    await user.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('result-container')).toBeInTheDocument()
    })
    
    // Clear everything
    await user.click(clearButton)
    
    expect(promptInput).toHaveValue('')
    expect(screen.queryByTestId('result-container')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })

  it('copies content to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup()
    const mockContent = 'Content to copy'
    mockGenerateContent.mockResolvedValue(mockContent)
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    // Generate content first
    await user.type(promptInput, 'Test prompt')
    await user.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('result-container')).toBeInTheDocument()
    })
    
    // Click copy button
    const copyButton = screen.getByTestId('copy-button')
    await user.click(copyButton)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockContent)
  })

  it('disables all buttons during generation', async () => {
    const user = userEvent.setup()
    // Mock a slow response
    mockGenerateContent.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('content'), 1000)))
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    const clearButton = screen.getByTestId('clear-button')
    
    await user.type(promptInput, 'Test prompt')
    await user.click(generateButton)
    
    // Check that buttons are disabled during generation
    expect(generateButton).toBeDisabled()
    expect(clearButton).toBeDisabled()
    expect(promptInput).toBeDisabled()
  })

  it('displays correct model and timestamp information', async () => {
    const user = userEvent.setup()
    const mockContent = 'Generated content'
    mockGenerateContent.mockResolvedValue(mockContent)
    
    render(<ContentGenerator />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-button')
    
    await user.type(promptInput, 'Test prompt')
    await user.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Model: GPT-3.5-turbo/)).toBeInTheDocument()
      expect(screen.getByText(/Generated:/)).toBeInTheDocument()
    })
  })
})