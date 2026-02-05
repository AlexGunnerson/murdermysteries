import { filterSecretsByStage, GameStage } from './storyUtils'

describe('filterSecretsByStage', () => {
  const mockSecrets = [
    'This is a secret with no stage marker - should always be included',
    'BEFORE ACT I IS COMPLETE: This secret should only appear in Act I',
    'AFTER ACT I IS COMPLETE: This secret should only appear in Act II',
    'Another secret with no marker',
    'After Act I is complete, this narrative version should only appear in Act II',
    'BEFORE ACT I IS COMPLETE: You MUST NOT reveal the papers. This is critical.',
    'AFTER ACT I IS COMPLETE: Once the detective proves the scene was staged, you\'ll drop your guard completely.',
  ]

  describe('start stage', () => {
    it('should include secrets without stage markers', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'start')
      
      expect(filtered).toContain('This is a secret with no stage marker - should always be included')
      expect(filtered).toContain('Another secret with no marker')
    })

    it('should include BEFORE ACT I secrets', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'start')
      
      expect(filtered).toContain('This secret should only appear in Act I')
      expect(filtered).toContain('You MUST NOT reveal the papers. This is critical.')
    })

    it('should exclude AFTER ACT I secrets', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'start')
      
      expect(filtered).not.toContain('This secret should only appear in Act II')
      expect(filtered).not.toContain('Once the detective proves the scene was staged, you\'ll drop your guard completely.')
      expect(filtered.some(s => s.includes('AFTER ACT I'))).toBe(false)
    })

    it('should strip stage markers from output', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'start')
      
      expect(filtered.some(s => s.includes('BEFORE ACT I IS COMPLETE:'))).toBe(false)
    })
  })

  describe('act_i stage', () => {
    it('should include secrets without stage markers', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_i')
      
      expect(filtered).toContain('This is a secret with no stage marker - should always be included')
      expect(filtered).toContain('Another secret with no marker')
    })

    it('should include BEFORE ACT I secrets', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_i')
      
      expect(filtered).toContain('This secret should only appear in Act I')
      expect(filtered).toContain('You MUST NOT reveal the papers. This is critical.')
    })

    it('should exclude AFTER ACT I secrets', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_i')
      
      expect(filtered).not.toContain('This secret should only appear in Act II')
      expect(filtered).not.toContain('Once the detective proves the scene was staged, you\'ll drop your guard completely.')
    })

    it('should strip stage markers from output', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_i')
      
      expect(filtered.some(s => s.includes('BEFORE ACT I IS COMPLETE:'))).toBe(false)
    })
  })

  describe('act_ii stage', () => {
    it('should include secrets without stage markers', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_ii')
      
      expect(filtered).toContain('This is a secret with no stage marker - should always be included')
      expect(filtered).toContain('Another secret with no marker')
    })

    it('should include AFTER ACT I secrets', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_ii')
      
      expect(filtered).toContain('This secret should only appear in Act II')
      expect(filtered).toContain('Once the detective proves the scene was staged, you\'ll drop your guard completely.')
    })

    it('should include narrative "After Act I is complete" versions', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_ii')
      
      expect(filtered).toContain('this narrative version should only appear in Act II')
    })

    it('should exclude BEFORE ACT I secrets', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_ii')
      
      expect(filtered).not.toContain('This secret should only appear in Act I')
      expect(filtered).not.toContain('You MUST NOT reveal the papers. This is critical.')
      expect(filtered.some(s => s.includes('BEFORE ACT I'))).toBe(false)
    })

    it('should strip stage markers from output', () => {
      const filtered = filterSecretsByStage(mockSecrets, 'act_ii')
      
      expect(filtered.some(s => s.includes('AFTER ACT I IS COMPLETE:'))).toBe(false)
      expect(filtered.some(s => s.includes('After Act I is complete,'))).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty secrets array', () => {
      const filtered = filterSecretsByStage([], 'act_ii')
      expect(filtered).toEqual([])
    })

    it('should handle case-insensitive stage markers', () => {
      const secrets = [
        'before act i is complete: lowercase version',
        'BEFORE ACT I IS COMPLETE: uppercase version',
        'Before Act I Is Complete: mixed case version',
      ]
      
      const filteredActI = filterSecretsByStage(secrets, 'act_i')
      expect(filteredActI).toHaveLength(3)
      
      const filteredActII = filterSecretsByStage(secrets, 'act_ii')
      expect(filteredActII).toHaveLength(0)
    })

    it('should trim whitespace from cleaned secrets', () => {
      const secrets = ['BEFORE ACT I IS COMPLETE:    Extra whitespace    ']
      const filtered = filterSecretsByStage(secrets, 'act_i')
      
      expect(filtered[0]).toBe('Extra whitespace')
    })
  })

  describe('real-world Veronica example', () => {
    it('should correctly filter Veronica\'s blackmail secrets', () => {
      const veronicaSecrets = [
        'CRITICAL SECRET - NO ONE KNOWS: You found blackmail papers scattered near Reginald\'s body.',
        'You hid the papers in a drawer in the vanity in the master bedroom',
        'BEFORE ACT I IS COMPLETE: You MUST NOT reveal the papers. This is absolutely critical.',
        'AFTER ACT I IS COMPLETE: Once the detective proves the scene was staged, you\'ll drop your guard completely and become a partner in the investigation.',
        'After Act I is complete, if asked why Dr. Vale\'s page is missing from the papers you found, you\'ll express genuine shock and confusion.',
      ]
      
      // Act I: Should hide the papers
      const actIFiltered = filterSecretsByStage(veronicaSecrets, 'act_i')
      expect(actIFiltered.some(s => s.includes('MUST NOT reveal'))).toBe(true)
      expect(actIFiltered.some(s => s.includes('drop your guard completely'))).toBe(false)
      expect(actIFiltered.some(s => s.includes('Dr. Vale\'s page is missing'))).toBe(false)
      
      // Act II: Should reveal the papers
      const actIIFiltered = filterSecretsByStage(veronicaSecrets, 'act_ii')
      expect(actIIFiltered.some(s => s.includes('MUST NOT reveal'))).toBe(false)
      expect(actIIFiltered.some(s => s.includes('drop your guard completely'))).toBe(true)
      expect(actIIFiltered.some(s => s.includes('Dr. Vale\'s page is missing'))).toBe(true)
      
      // Always-present secrets should be in both
      expect(actIFiltered).toContain('CRITICAL SECRET - NO ONE KNOWS: You found blackmail papers scattered near Reginald\'s body.')
      expect(actIIFiltered).toContain('CRITICAL SECRET - NO ONE KNOWS: You found blackmail papers scattered near Reginald\'s body.')
    })
  })
})
