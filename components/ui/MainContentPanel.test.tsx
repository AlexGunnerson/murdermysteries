import { render, screen } from '@testing-library/react'
import { MainContentPanel } from './MainContentPanel'

describe('MainContentPanel', () => {
  it('renders children content', () => {
    render(
      <MainContentPanel>
        <div>Test Content</div>
      </MainContentPanel>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with optional title', () => {
    render(
      <MainContentPanel title="Test Title">
        <div>Content</div>
      </MainContentPanel>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders without title when not provided', () => {
    const { container } = render(
      <MainContentPanel>
        <div>Content</div>
      </MainContentPanel>
    )
    
    const heading = container.querySelector('h1')
    expect(heading).toBeNull()
  })

  it('applies correct styling classes', () => {
    const { container } = render(
      <MainContentPanel title="Test">
        <div>Content</div>
      </MainContentPanel>
    )
    
    const mainDiv = container.querySelector('.flex-1')
    expect(mainDiv).toHaveClass('bg-gray-900', 'overflow-y-auto')
  })

  it('wraps content in proper container structure', () => {
    const { container } = render(
      <MainContentPanel>
        <div data-testid="test-content">Content</div>
      </MainContentPanel>
    )
    
    const content = screen.getByTestId('test-content')
    const parent = content.parentElement
    
    expect(parent).toHaveClass('text-gray-200')
  })

  it('displays title with decorative underline', () => {
    const { container } = render(
      <MainContentPanel title="Case Title">
        <div>Content</div>
      </MainContentPanel>
    )
    
    const underline = container.querySelector('.h-1.w-20.bg-blue-500')
    expect(underline).toBeInTheDocument()
  })

  it('handles long content with scrolling', () => {
    const longContent = 'A'.repeat(1000)
    const { container } = render(
      <MainContentPanel>
        <div>{longContent}</div>
      </MainContentPanel>
    )
    
    const scrollContainer = container.querySelector('.overflow-y-auto')
    expect(scrollContainer).toBeInTheDocument()
  })

  it('maintains consistent max-width for content', () => {
    const { container } = render(
      <MainContentPanel title="Test">
        <div>Content</div>
      </MainContentPanel>
    )
    
    const contentContainer = container.querySelector('.max-w-5xl')
    expect(contentContainer).toBeInTheDocument()
  })
})

