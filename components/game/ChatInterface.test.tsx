import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChatInterface } from './ChatInterface'
import { useGameStore } from '@/lib/store/gameStore'
import { act, renderHook } from '@testing-library/react'

// Mock the fetch API
global.fetch = jest.fn()

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

describe('ChatInterface', () => {
  const mockProps = {
    suspectId: 'suspect_01',
    suspectName: 'John Doe',
    suspectRole: 'Witness',
    suspectPersonality: 'Nervous, evasive',
    systemPrompt: 'You are a witness in a murder investigation.',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset game store
    const { result } = renderHook(() => useGameStore())
    act(() => {
      result.current.resetGame()
      result.current.initializeGame('case01')
    })
  })

  it('renders suspect information', () => {
    render(<ChatInterface {...mockProps} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Witness')).toBeInTheDocument()
  })

  it('renders message input and send button', () => {
    render(<ChatInterface {...mockProps} />)
    
    expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('disables send button when input is empty', () => {
    render(<ChatInterface {...mockProps} />)
    
    const sendButton = screen.getByRole('button')
    expect(sendButton).toBeDisabled()
  })

  it('enables send button when input has text', () => {
    render(<ChatInterface {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText('Ask a question...')
    const sendButton = screen.getByRole('button')
    
    fireEvent.change(textarea, { target: { value: 'What did you see?' } })
    
    expect(sendButton).not.toBeDisabled()
  })

  it('displays chat history', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.addChatMessage({
        suspectId: 'suspect_01',
        role: 'user',
        content: 'Hello',
      })
      result.current.addChatMessage({
        suspectId: 'suspect_01',
        role: 'assistant',
        content: 'Hi detective',
      })
    })
    
    render(<ChatInterface {...mockProps} />)
    
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi detective')).toBeInTheDocument()
  })

  it('shows only messages for current suspect', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.addChatMessage({
        suspectId: 'suspect_01',
        role: 'user',
        content: 'Message for suspect 1',
      })
      result.current.addChatMessage({
        suspectId: 'suspect_02',
        role: 'user',
        content: 'Message for suspect 2',
      })
    })
    
    render(<ChatInterface {...mockProps} />)
    
    expect(screen.getByText('Message for suspect 1')).toBeInTheDocument()
    expect(screen.queryByText('Message for suspect 2')).not.toBeInTheDocument()
  })

  it('distinguishes user and assistant messages visually', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.addChatMessage({
        suspectId: 'suspect_01',
        role: 'user',
        content: 'User message',
      })
      result.current.addChatMessage({
        suspectId: 'suspect_01',
        role: 'assistant',
        content: 'Assistant message',
      })
    })
    
    const { container } = render(<ChatInterface {...mockProps} />)
    
    const userMessage = screen.getByText('User message').closest('div')
    const assistantMessage = screen.getByText('Assistant message').closest('div')
    
    expect(userMessage?.className).toContain('bg-amber-700')
    expect(assistantMessage?.className).toContain('bg-gray-800')
  })

  it('clears input after sending message', async () => {
    // Mock successful fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"text":"Hello"}\n\n'),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"done":true}\n\n'),
            })
            .mockResolvedValue({ done: true }),
        }),
      },
    })
    
    render(<ChatInterface {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText('Ask a question...') as HTMLTextAreaElement
    const sendButton = screen.getByRole('button')
    
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('disables input while streaming', async () => {
    // Mock streaming response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"text":"Streaming"}\n\n'),
            })
            .mockImplementation(() => new Promise(() => {})), // Never resolves to keep streaming
        }),
      },
    })
    
    render(<ChatInterface {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText('Ask a question...')
    const sendButton = screen.getByRole('button')
    
    fireEvent.change(textarea, { target: { value: 'Test' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(textarea).toBeDisabled()
    })
  })

  it('sends message on Enter key', () => {
    render(<ChatInterface {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText('Ask a question...')
    
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    
    expect(global.fetch).toHaveBeenCalled()
  })

  it('does not send message on Shift+Enter', () => {
    render(<ChatInterface {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText('Ask a question...')
    
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

