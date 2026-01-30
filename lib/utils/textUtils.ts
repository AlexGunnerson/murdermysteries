/**
 * Utility functions for text processing
 */

/**
 * Intelligently concatenate text chunks with proper spacing
 * Fixes the issue where streaming AI responses have words blended together
 * 
 * This function handles the primary bug: word characters being concatenated
 * without spaces (e.g., "We wererefining" instead of "We were refining").
 * 
 * It also detects common word suffixes to avoid splitting words incorrectly
 * (e.g., "incent" + "ive" → "incentive", not "incent ive").
 * 
 * @param existing - The accumulated text so far
 * @param newChunk - The new chunk to append
 * @returns Concatenated text with proper spacing
 * 
 * @example
 * smartConcat("We were", "refining") // "We were refining" ✓ FIXES MAIN BUG
 * smartConcat("Hello", "world") // "Hello world"
 * smartConcat("incent", "ive") // "incentive" ✓ HANDLES SUFFIX
 * smartConcat("word", ".") // "word."
 */
export function smartConcat(existing: string, newChunk: string): string {
  // Handle empty cases
  if (!existing) return newChunk
  if (!newChunk) return existing
  
  const lastChar = existing[existing.length - 1]
  const firstChar = newChunk[0]
  
  // Check if both are word characters
  const lastIsWord = /\w/.test(lastChar)
  const firstIsWord = /\w/.test(firstChar)
  
  // If not both word characters, no space needed
  if (!lastIsWord || !firstIsWord) {
    return existing + newChunk
  }
  
  // Both are word characters - but check if newChunk is a common suffix
  // Common English suffixes that indicate continuation of a word
  const commonSuffixes = /^(ive|ing|ed|ly|tion|sion|ness|ment|ful|less|able|ible|ous|ious|al|ual|ic|ical|ant|ent|ence|ance|ity|ty|er|or|ist|ism|ship|hood|dom|ward|wards|wise|like)$/i
  
  // Check if the new chunk looks like a suffix (and is relatively short)
  const looksLikeSuffix = newChunk.length <= 7 && commonSuffixes.test(newChunk.toLowerCase())
  
  // If it looks like a suffix, don't add space
  if (looksLikeSuffix) {
    return existing + newChunk
  }
  
  // Otherwise, add space between word characters
  return existing + ' ' + newChunk
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
