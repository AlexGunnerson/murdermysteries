import { smartConcat, isWhitespace, isPunctuation } from './textUtils'

describe('textUtils', () => {
  describe('smartConcat', () => {
    it('handles empty existing text', () => {
      expect(smartConcat('', 'hello')).toBe('hello')
    })

    it('handles empty new chunk', () => {
      expect(smartConcat('hello', '')).toBe('hello')
    })

    it('handles both empty', () => {
      expect(smartConcat('', '')).toBe('')
    })

    it('concatenates chunks directly (AI provides proper spacing)', () => {
      // AI sends properly formatted text with spaces included
      expect(smartConcat('We were ', 'refining')).toBe('We were refining')
      expect(smartConcat('Hello ', 'world')).toBe('Hello world')
    })

    it('handles punctuation correctly', () => {
      expect(smartConcat('Hello', '.')).toBe('Hello.')
      expect(smartConcat('word', ',')).toBe('word,')
      expect(smartConcat('question', '?')).toBe('question?')
      expect(smartConcat('exclamation', '!')).toBe('exclamation!')
    })

    it('preserves spaces in chunks', () => {
      expect(smartConcat('Hello ', 'world')).toBe('Hello world')
      expect(smartConcat('word', ' nextword')).toBe('word nextword')
    })

    it('handles mid-word splits correctly (main fix)', () => {
      // This is the key fix: AI can split words mid-stream
      // "Moments" might come as "Mom" + "ents later"
      expect(smartConcat('Mom', 'ents later')).toBe('Moments later')
      expect(smartConcat('extraor', 'dinary')).toBe('extraordinary')
      expect(smartConcat('incent', 'ive')).toBe('incentive')
    })

    it('handles contractions and apostrophes', () => {
      expect(smartConcat("don", "'t")).toBe("don't")
      expect(smartConcat("it", "'s")).toBe("it's")
    })

    it('handles real-world streaming scenario with proper spacing', () => {
      // AI sends chunks with spaces already included
      let response = ''
      const chunks = [
        'I ',
        'was ',
        'at ',
        'the ',
        'office ',
        'when ',
        'I ',
        'heard ',
        'the ',
        'commotion',
        '.',
      ]
      
      for (const chunk of chunks) {
        response = smartConcat(response, chunk)
      }
      
      expect(response).toBe('I was at the office when I heard the commotion.')
    })

    it('handles parentheses correctly', () => {
      expect(smartConcat('word', '(')).toBe('word(')
      expect(smartConcat('test', ')')).toBe('test)')
    })

    it('handles quotes correctly', () => {
      expect(smartConcat('He said ', '"hello"')).toBe('He said "hello"')
      expect(smartConcat('word', "'")).toBe("word'")
    })
  })

  describe('isWhitespace', () => {
    it('detects spaces', () => {
      expect(isWhitespace(' ')).toBe(true)
    })

    it('detects tabs', () => {
      expect(isWhitespace('\t')).toBe(true)
    })

    it('detects newlines', () => {
      expect(isWhitespace('\n')).toBe(true)
    })

    it('rejects non-whitespace', () => {
      expect(isWhitespace('a')).toBe(false)
      expect(isWhitespace('1')).toBe(false)
      expect(isWhitespace('.')).toBe(false)
    })
  })

  describe('isPunctuation', () => {
    it('detects common punctuation', () => {
      expect(isPunctuation('.')).toBe(true)
      expect(isPunctuation(',')).toBe(true)
      expect(isPunctuation('!')).toBe(true)
      expect(isPunctuation('?')).toBe(true)
      expect(isPunctuation(';')).toBe(true)
      expect(isPunctuation(':')).toBe(true)
    })

    it('detects quotes', () => {
      expect(isPunctuation('"')).toBe(true)
      expect(isPunctuation("'")).toBe(true)
    })

    it('detects closing brackets', () => {
      expect(isPunctuation(')')).toBe(true)
      expect(isPunctuation(']')).toBe(true)
    })

    it('rejects non-punctuation', () => {
      expect(isPunctuation('a')).toBe(false)
      expect(isPunctuation('1')).toBe(false)
      expect(isPunctuation(' ')).toBe(false)
    })
  })
})
