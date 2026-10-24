import { describe, it, expect } from 'vitest'
import {
    isAlertDue,
    getAlertSubscriptions,
    getTrialCountdown,
    trialLabel,
    describeDueDate,
} from './alerts'

// A fixed "today" (21 Oct 2026) so the tests give the same result on any day
const today = new Date(2026, 9, 21)

describe('48-hour alert', () => {
    it('TC-UNIT-04: a billing date tomorrow fires the alert', () => {
        expect(isAlertDue('2026-10-22', today)).toBe(true)
    })

    it('TC-UNIT-05: a billing date in 5 days does not fire the alert', () => {
        expect(isAlertDue('2026-10-26', today)).toBe(false)
    })

    it('fires today and in 2 days (the edge of the window)', () => {
        expect(isAlertDue('2026-10-21', today)).toBe(true)
        expect(isAlertDue('2026-10-23', today)).toBe(true)
    })

    it('does not fire in 3 days or for a date in the past', () => {
        expect(isAlertDue('2026-10-24', today)).toBe(false)
        expect(isAlertDue('2026-10-20', today)).toBe(false)
    })

    it('getAlertSubscriptions keeps only the subscriptions due soon', () => {
        const subs = [
            { id: 1, service_name: 'Netflix', next_billing_date: '2026-10-22' },
            { id: 2, service_name: 'Notion', next_billing_date: '2027-01-10' },
            { id: 3, service_name: 'Spotify', next_billing_date: '2026-10-21' },
        ]
        const result = getAlertSubscriptions(subs, today)
        expect(result.map((s) => s.service_name)).toEqual(['Netflix', 'Spotify'])
    })
})

describe('trial countdown', () => {
    it('TC-UNIT-06: a trial ending in 7 days returns 7', () => {
        const sub = { is_trial: true, next_billing_date: '2026-10-28' }
        expect(getTrialCountdown(sub, today)).toBe(7)
    })

    it('returns null when the subscription is not a trial', () => {
        const sub = { is_trial: false, next_billing_date: '2026-10-28' }
        expect(getTrialCountdown(sub, today)).toBeNull()
    })

    it('builds the label shown in the list', () => {
        expect(trialLabel({ is_trial: true, next_billing_date: '2026-10-28' }, today)).toBe('Yes (7 days left)')
        expect(trialLabel({ is_trial: true, next_billing_date: '2026-10-22' }, today)).toBe('Yes (1 day left)')
        expect(trialLabel({ is_trial: true, next_billing_date: '2026-10-20' }, today)).toBe('Yes (ended)')
        expect(trialLabel({ is_trial: false, next_billing_date: '2026-10-28' }, today)).toBe('No')
    })
})

describe('describeDueDate', () => {
    it('words today, tomorrow and later days', () => {
        expect(describeDueDate(0)).toBe('today')
        expect(describeDueDate(1)).toBe('tomorrow')
        expect(describeDueDate(2)).toBe('in 2 days')
    })
})