/**
 * Utility functions for text processing
 */

/**
 * Concatenate text chunks from streaming AI responses
 * 
 * Simply concatenates chunks without modification. The AI model (Gemini)
 * sends properly formatted text with spaces already included where needed.
 * 
 * Previous versions tried to intelligently add spaces between word characters,
 * but this caused issues when the AI splits words mid-stream (e.g., "Mom" + "ents"
 * becoming "Mom ents" instead of "Moments").
 * 
 * @param existing - The accumulated text so far
 * @param newChunk - The new chunk to append
 * @returns Concatenated text
 * 
 * @example
 * smartConcat("Hello ", "world") // "Hello world"
 * smartConcat("Mom", "ents later") // "Moments later"
 * smartConcat("word", ".") // "word."
 */
export function smartConcat(existing: string, newChunk: string): string {
  // Handle empty cases
  if (!existing) return newChunk
  if (!newChunk) return existing
  
  // Simple concatenation - AI sends properly formatted text with spaces included
  return existing + newChunk
}

/**
 * Test if a character is whitespace
 */
export function isWhitespace(char: string): boolean {
  return /\s/.test(char)
}

/**
 * Test if a character is punctuation
 */
export function isPunctuation(char: string): boolean {
  return /[.,!?;:'")\]]/.test(char)
}
