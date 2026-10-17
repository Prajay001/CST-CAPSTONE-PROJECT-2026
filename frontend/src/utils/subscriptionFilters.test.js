import { describe, it, expect } from 'vitest'
import { filterAndSortSubscriptions } from './subscriptionFilters'

const sample = [
    {
        id: 1,
        service_name: 'Netflix',
        cost: 15.99,
        billing_cycle: 'Monthly',
        next_billing_date: '2026-11-20',
        is_trial: false,
        category: 'Entertainment',
    },
    {
        id: 2,
        service_name: 'Spotify',
        cost: 9.99,
        billing_cycle: 'Monthly',
        next_billing_date: '2026-11-05',
        is_trial: true,
        category: 'Entertainment',
    },
    {
        id: 3,
        service_name: 'Notion',
        cost: 120,
        billing_cycle: 'Annual',
        next_billing_date: '2027-01-10',
        is_trial: false,
        category: 'Productivity',
    },
]

describe('filterAndSortSubscriptions', () => {
    it('search by service name finds only the match (TC-FE-12 logic)', () => {
        const result = filterAndSortSubscriptions(sample, { search: 'spot' })
        expect(result).toHaveLength(1)
        expect(result[0].service_name).toBe('Spotify')
    })

    it('filters by trial status (TC-FE-13 logic)', () => {
        const result = filterAndSortSubscriptions(sample, { trial: 'Yes' })
        expect(result.map((s) => s.service_name)).toEqual(['Spotify'])
    })

    it('filters by category (TC-FE-14 logic)', () => {
        const result = filterAndSortSubscriptions(sample, { category: 'Productivity' })
        expect(result.map((s) => s.service_name)).toEqual(['Notion'])
    })

    it('filters by billing cycle (TC-FE-15 logic)', () => {
        const result = filterAndSortSubscriptions(sample, { cycle: 'Annual' })
        expect(result.map((s) => s.service_name)).toEqual(['Notion'])
    })

    it('sorts by next billing date, soonest first (TC-FE-16 logic)', () => {
        const result = filterAndSortSubscriptions(sample, { sortBy: 'date' })
        expect(result.map((s) => s.service_name)).toEqual(['Spotify', 'Netflix', 'Notion'])
    })

    it('sorts by cost, highest first (TC-FE-17 logic)', () => {
        const result = filterAndSortSubscriptions(sample, { sortBy: 'cost' })
        expect(result.map((s) => s.service_name)).toEqual(['Notion', 'Netflix', 'Spotify'])
    })
})