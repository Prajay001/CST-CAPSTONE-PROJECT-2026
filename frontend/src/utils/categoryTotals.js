import { calculateMonthlyBurnRate } from './calculations'

// Groups subscriptions by category and works out the monthly cost of each group.
// Uses the same burn-rate function as the Dashboard, so the numbers always match.
export function getCategoryTotals(subscriptions) {
    const groups = {}

    subscriptions.forEach((sub) => {
        const name = sub.category || 'Uncategorized'
        if (!groups[name]) {
            groups[name] = []
        }
        groups[name].push(sub)
    })

    const rows = Object.keys(groups).map((category) => ({
        category,
        count: groups[category].length,
        monthly: calculateMonthlyBurnRate(groups[category]),
    }))

    const total = rows.reduce((sum, row) => sum + row.monthly, 0)

    return rows
        .map((row) => ({
            ...row,
            percent: total > 0 ? (row.monthly / total) * 100 : 0,
        }))
        .sort((a, b) => b.monthly - a.monthly)
}