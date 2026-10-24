import { describe, it, expect } from 'vitest'
import { validatePassword } from './Register'

describe('Password Validation Logic', () => {
    it('TC-UNIT-07: accepts a valid strong password', () => {
        const result = validatePassword('P@ssword1')
        expect(result).toBeNull()
    })
    it('TC-UNIT-08: rejects password missing a special character', () => {
        const result = validatePassword('Password1')
        expect(result).toBe('Password must contain at least one special character')
    })

    it('TC-UNIT-09: rejects password that is too short', () => {
        const result = validatePassword('Pa@1')
        expect(result).toBe('Password must be at least 8 characters')
    })
    it('rejects password missing an uppercase letter', () => {
        const result = validatePassword('p@ssword1')
        expect(result).toBe('Password must contain at least one uppercase letter')
    })

    it('rejects password missing a lowercase letter', () => {
        const result = validatePassword('P@SSWORD1')
        expect(result).toBe('Password must contain at least one lowercase letter')
    })

    it('rejects password missing a number', () => {
        const result = validatePassword('P@ssword')
        expect(result).toBe('Password must contain at least one number')
    })
})