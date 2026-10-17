import { describe, it, expect } from 'vitest'
import {
    calculateMonthlyBurnRate,
    calculateYearlyProjection,
} from './calculations'

describe('calculateMonthlyBurnRate', () => {
    it('TC-UNIT-01: adds two monthly subscriptions ($10.00 + $15.99 = $25.99)', () => {
        const subs = [
            { cost: 10, billing_cycle: 'Monthly' },
            { cost: 15.99, billing_cycle: 'Monthly' },
        ]
        expect(calculateMonthlyBurnRate(subs)).toBe(25.99)
    })

    it('TC-UNIT-02: converts an annual $120.00 subscription to $10.00 per month', () => {
        const subs = [{ cost: 120, billing_cycle: 'Annual' }]
        expect(calculateMonthlyBurnRate(subs)).toBe(10)
    })

    it('mixes monthly and annual subscriptions', () => {
        const subs = [
            { cost: 10, billing_cycle: 'Monthly' },
            { cost: 120, billing_cycle: 'Annual' },
        ]
        expect(calculateMonthlyBurnRate(subs)).toBe(20)
    })

    it('TC-FE-19 logic: three monthly subs of $10, $15, $20 give $45.00', () => {
        const subs = [
            { cost: 10, billing_cycle: 'Monthly' },
            { cost: 15, billing_cycle: 'Monthly' },
            { cost: 20, billing_cycle: 'Monthly' },
        ]
        expect(calculateMonthlyBurnRate(subs)).toBe(45)
    })

    it('returns 0 when there are no subscriptions', () => {
        expect(calculateMonthlyBurnRate([])).toBe(0)
    })
})

describe('calculateYearlyProjection', () => {
    it('TC-UNIT-03: one monthly ($10) and one annual ($120) give $240.00', () => {
        const subs = [
            { cost: 10, billing_cycle: 'Monthly' },
            { cost: 120, billing_cycle: 'Annual' },
        ]
        expect(calculateYearlyProjection(subs)).toBe(240)
    })

    it('TC-FE-21 logic: one monthly ($10) and one annual ($60) give $180.00', () => {
        const subs = [
            { cost: 10, billing_cycle: 'Monthly' },
            { cost: 60, billing_cycle: 'Annual' },
        ]
        expect(calculateYearlyProjection(subs)).toBe(180)
    })
})