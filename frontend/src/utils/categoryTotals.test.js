import { describe, it, expect, vi } from 'vitest'

// Simple stand-in so these tests only check the grouping logic
vi.mock('./calculations', () => ({
    calculateMonthlyBurnRate: (subs) =>
        subs.reduce((sum, s) => sum + Number(s.cost), 0),
}))

import { getCategoryTotals } from './categoryTotals'

const subs = [
    { id: 1, service_name: 'Netflix', cost: 10, category: 'Entertainment' },
    { id: 2, service_name: 'Spotify', cost: 5, category: 'Entertainment' },
    { id: 3, service_name: 'Gym', cost: 40, category: 'Health' },
    { id: 4, service_name: 'Mystery', cost: 5, category: null },
]

describe('getCategoryTotals', () => {
    it('groups subscriptions and adds up each category', () => {
        const result = getCategoryTotals(subs)
        const entertainment = result.find((r) => r.category === 'Entertainment')
        expect(entertainment.monthly).toBe(15)
        expect(entertainment.count).toBe(2)
    })

    it('sorts the biggest category first and works out percentages', () => {
        const result = getCategoryTotals(subs)
        expect(result.map((r) => r.category)).toEqual([
            'Health',
            'Entertainment',
            'Uncategorized',
        ])
        expect(result[0].percent).toBeCloseTo(66.67, 1)
        expect(result[1].percent).toBeCloseTo(25, 1)
    })

    it('puts missing categories under Uncategorized and handles an empty list', () => {
        const result = getCategoryTotals(subs)
        expect(result.find((r) => r.category === 'Uncategorized').monthly).toBe(5)
        expect(getCategoryTotals([])).toEqual([])
    })
})