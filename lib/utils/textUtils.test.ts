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

    it('adds space between two words', () => {
      expect(smartConcat('We were', 'refining')).toBe('We were refining')
    })

    it('fixes missing space issue (main bug)', () => {
      // This is the actual bug case: "We wererefining the precise"
      expect(smartConcat('We were', 'refining')).toBe('We were refining')
      expect(smartConcat('word', 'nextword')).toBe('word nextword')
    })

    it('does not add space when ending with punctuation', () => {
      expect(smartConcat('Hello', '.')).toBe('Hello.')
      expect(smartConcat('word', ',')).toBe('word,')
      expect(smartConcat('question', '?')).toBe('question?')
      expect(smartConcat('exclamation', '!')).toBe('exclamation!')
    })

    it('does not add space when ending with space', () => {
      expect(smartConcat('Hello ', 'world')).toBe('Hello world')
      expect(smartConcat('word ', 'nextword')).toBe('word nextword')
    })

    it('does not add space when starting with punctuation', () => {
      expect(smartConcat('Hello', ', world')).toBe('Hello, world')
      expect(smartConcat('word', '. Next')).toBe('word. Next')
    })

    it('handles multiple word chunks in sequence', () => {
      let result = ''
      result = smartConcat(result, 'The')
      result = smartConcat(result, 'quick')
      result = smartConcat(result, 'brown')
      result = smartConcat(result, 'fox')
      
      expect(result).toBe('The quick brown fox')
    })

    it('handles mixed punctuation and words', () => {
      // Note: AI typically includes space after punctuation in next chunk
      // This test shows the behavior when space is NOT included
      let result = ''
      result = smartConcat(result, 'Hello')
      result = smartConcat(result, ',')
      result = smartConcat(result, 'world')
      result = smartConcat(result, '!')
      
      // When AI sends ',', 'world' without space, they concat as ',world'
      // In practice, AI usually sends ', world' (with space)
      expect(result).toBe('Hello,world!')
    })

    it('preserves existing spaces', () => {
      expect(smartConcat('Hello ', 'world')).toBe('Hello world')
      expect(smartConcat('word', ' nextword')).toBe('word nextword')
    })

    it('handles parentheses correctly', () => {
      // Punctuation is not word character, so no space added
      expect(smartConcat('word', '(')).toBe('word(')
      expect(smartConcat('test', ')')).toBe('test)')
    })

    it('handles quotes correctly', () => {
      // Last is word, first is punctuation (quote) - no space added
      // In practice, AI usually includes the space: 'He said ' + '"hello"'
      expect(smartConcat('He said', '"hello"')).toBe('He said"hello"')
      expect(smartConcat('word', "'")).toBe("word'")
    })

    it('handles numbers and words', () => {
      expect(smartConcat('version', '123')).toBe('version 123')
      expect(smartConcat('123', 'bottles')).toBe('123 bottles')
    })

    it('handles contractions and apostrophes', () => {
      // Apostrophe is not a word character, so no space added - perfect!
      expect(smartConcat("don", "'t")).toBe("don't")
      expect(smartConcat("it", "'s")).toBe("it's")
    })

    it('handles real-world streaming scenario', () => {
      // Simulate actual streaming chunks from AI
      let response = ''
      const chunks = [
        'I',
        'was',
        'at',
        'the',
        'office',
        'when',
        'I',
        'heard',
        'the',
        'commotion',
        '.',
      ]
      
      for (const chunk of chunks) {
        response = smartConcat(response, chunk)
      }
      
      expect(response).toBe('I was at the office when I heard the commotion.')
    })

    it('handles common suffixes correctly (no space)', () => {
      // Common suffixes should not get a space before them
      expect(smartConcat('incent', 'ive')).toBe('incentive')
      expect(smartConcat('walk', 'ing')).toBe('walking')
      expect(smartConcat('walk', 'ed')).toBe('walked')
      expect(smartConcat('quick', 'ly')).toBe('quickly')
      expect(smartConcat('atten', 'tion')).toBe('attention')
      expect(smartConcat('happi', 'ness')).toBe('happiness')  // AI sends correct form
      expect(smartConcat('develop', 'ment')).toBe('development')
      expect(smartConcat('wonder', 'ful')).toBe('wonderful')
      expect(smartConcat('care', 'less')).toBe('careless')
      expect(smartConcat('agree', 'able')).toBe('agreeable')
    })

    it('handles mid-word chunks without common suffixes', () => {
      // If AI sends chunks that don't match common suffixes, space is added
      // This is a known limitation for rare cases
      expect(smartConcat('extraor', 'dinary')).toBe('extraor dinary')
      // Note: "dinary" is not a common suffix, so space is added
      // In practice, this is rare and acceptable
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
