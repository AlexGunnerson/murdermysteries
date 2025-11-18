import { render, screen, fireEvent } from '@testing-library/react'
import { ActionPanel } from './ActionPanel'

describe('ActionPanel', () => {
  const mockOnAction = jest.fn()

  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders with detective points', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Detective Points')).toBeInTheDocument()
  })

  it('displays all action buttons', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    expect(screen.getByText('Question Suspects')).toBeInTheDocument()
    expect(screen.getByText('Check Records')).toBeInTheDocument()
    expect(screen.getByText('Investigate Scenes')).toBeInTheDocument()
    expect(screen.getByText('Validate Theory')).toBeInTheDocument()
    expect(screen.getByText('Get Clue')).toBeInTheDocument()
    expect(screen.getByText('Solve the Murder')).toBeInTheDocument()
  })

  it('shows correct DP costs for actions', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    const twoPointCosts = screen.getAllByText('-2 DP') // Check Records and Get Clue
    const threePointCosts = screen.getAllByText('-3 DP') // Investigate Scenes and Validate Theory
    
    expect(twoPointCosts).toHaveLength(2) // Two actions cost -2 DP
    expect(threePointCosts).toHaveLength(2) // Two actions cost -3 DP
  })

  it('calls onAction when action button is clicked', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    const questionButton = screen.getByText('Question Suspects')
    fireEvent.click(questionButton)
    
    expect(mockOnAction).toHaveBeenCalledWith('question')
  })

  it('calls onAction when How to Play button is clicked', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    const helpButton = screen.getByText('❓ How to Play')
    fireEvent.click(helpButton)
    
    expect(mockOnAction).toHaveBeenCalledWith('help')
  })

  it('calls onAction when Menu button is clicked', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    const menuButton = screen.getByText('⚙️ Menu')
    fireEvent.click(menuButton)
    
    expect(mockOnAction).toHaveBeenCalledWith('menu')
  })

  it('disables expensive actions when DP is insufficient', () => {
    render(<ActionPanel detectivePoints={1} onAction={mockOnAction} />)
    
    const recordsButton = screen.getByText('Check Records').closest('button')
    const scenesButton = screen.getByText('Investigate Scenes').closest('button')
    
    expect(recordsButton).toBeDisabled()
    expect(scenesButton).toBeDisabled()
  })

  it('does not disable free actions when DP is low', () => {
    render(<ActionPanel detectivePoints={0} onAction={mockOnAction} />)
    
    const questionButton = screen.getByText('Question Suspects').closest('button')
    const solveButton = screen.getByText('Solve the Murder').closest('button')
    
    expect(questionButton).not.toBeDisabled()
    expect(solveButton).not.toBeDisabled()
  })

  it('displays notebook button in footer', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    expect(screen.getByText('📓 Notebook')).toBeInTheDocument()
  })

  it('calls onAction when notebook button is clicked', () => {
    render(<ActionPanel detectivePoints={25} onAction={mockOnAction} />)
    
    const notebookButton = screen.getByText('📓 Notebook')
    fireEvent.click(notebookButton)
    
    expect(mockOnAction).toHaveBeenCalledWith('notebook')
  })
})

