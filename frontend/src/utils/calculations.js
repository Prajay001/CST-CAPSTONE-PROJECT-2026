function roundMoney(amount) {
    return Math.round(amount * 100) / 100
}


export function calculateMonthlyBurnRate(subscriptions) {
    const total = subscriptions.reduce((sum, s) => {
        const cost = Number(s.cost)
        return sum + (s.billing_cycle === 'Annual' ? cost / 12 : cost)
    }, 0)
    return roundMoney(total)
}

// Yearly projection: what the user pays over 12 months in total.
// Monthly subscriptions are multiplied by 12, annual ones count once.
export function calculateYearlyProjection(subscriptions) {
    const total = subscriptions.reduce((sum, s) => {
        const cost = Number(s.cost)
        return sum + (s.billing_cycle === 'Monthly' ? cost * 12 : cost)
    }, 0)
    return roundMoney(total)
}