import {
  extractFactsFromResponse,
  sanitizeResponseForClient,
} from './aiService'

describe('aiService', () => {
  describe('extractFactsFromResponse', () => {
    it('extracts facts with time mentions', () => {
      const response = 'I was at the office at 3:00 PM when I heard the commotion.'
      const knownFacts: string[] = []
      
      const facts = extractFactsFromResponse(response, knownFacts)
      
      expect(facts.length).toBeGreaterThan(0)
      expect(facts[0]).toContain('3:00 PM')
    })

    it('extracts facts with day mentions', () => {
      const response = 'On Tuesday, I saw the victim arguing with someone.'
      const knownFacts: string[] = []
      
      const facts = extractFactsFromResponse(response, knownFacts)
      
      expect(facts.length).toBeGreaterThan(0)
      expect(facts[0]).toContain('Tuesday')
    })

    it('extracts facts with "I saw" pattern', () => {
      const response = 'I saw a suspicious car parked outside the building.'
      const knownFacts: string[] = []
      
      const facts = extractFactsFromResponse(response, knownFacts)
      
      expect(facts.length).toBeGreaterThan(0)
      expect(facts[0]).toContain('suspicious car')
    })

    it('does not extract already known facts', () => {
      const response = 'I was at the office at 3:00 PM.'
      const knownFacts = ['I was at the office at 3:00 PM']
      
      const facts = extractFactsFromResponse(response, knownFacts)
      
      expect(facts.length).toBe(0)
    })

    it('filters out very short sentences', () => {
      const response = 'I saw it. Really.'
      const knownFacts: string[] = []
      
      const facts = extractFactsFromResponse(response, knownFacts)
      
      expect(facts.length).toBe(0)
    })

    it('filters out very long sentences', () => {
      const response = 'I saw ' + 'a'.repeat(300)
      const knownFacts: string[] = []
      
      const facts = extractFactsFromResponse(response, knownFacts)
      
      expect(facts.length).toBe(0)
    })

    it('extracts multiple facts from one response', () => {
      const response = 'I was at the library at 2:00 PM. I saw the victim there talking to someone.'
      const knownFacts: string[] = []
      
      const facts = extractFactsFromResponse(response, knownFacts)
      
      expect(facts.length).toBeGreaterThan(0)
    })
  })

  describe('sanitizeResponseForClient', () => {
    it('removes system prompt markers', () => {
      const response = 'You are playing the role of John. Hello detective.'
      const sanitized = sanitizeResponseForClient(response)
      
      expect(sanitized).not.toContain('You are playing the role')
      expect(sanitized).toBe('')
    })

    it('removes SYSTEM: markers', () => {
      const response = 'SYSTEM: Internal instruction. Hello detective.'
      const sanitized = sanitizeResponseForClient(response)
      
      expect(sanitized).not.toContain('SYSTEM:')
      expect(sanitized).toBe('')
    })

    it('removes INSTRUCTIONS: markers', () => {
      const response = 'INSTRUCTIONS: Do this. Hello detective.'
      const sanitized = sanitizeResponseForClient(response)
      
      expect(sanitized).not.toContain('INSTRUCTIONS:')
      expect(sanitized).toBe('')
    })

    it('keeps clean responses unchanged', () => {
      const response = 'Hello detective, how can I help you today?'
      const sanitized = sanitizeResponseForClient(response)
      
      expect(sanitized).toBe(response)
    })

    it('trims whitespace', () => {
      const response = '  Hello detective  '
      const sanitized = sanitizeResponseForClient(response)
      
      expect(sanitized).toBe('Hello detective')
    })
  })
})

