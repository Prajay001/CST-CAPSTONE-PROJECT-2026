// Filters and sorts a list of subscriptions.
// It never changes the original array, it returns a new one.
export function filterAndSortSubscriptions(subscriptions, options) {
    const {
        search = '',
        trial = 'All',
        category = 'All',
        cycle = 'All',
        sortBy = 'date',
    } = options

    const term = search.trim().toLowerCase()

    // filter() builds a new array with only the rows that pass every check
    const result = subscriptions.filter((s) => {
        if (term && !s.service_name.toLowerCase().includes(term)) return false
        if (trial === 'Yes' && !s.is_trial) return false
        if (trial === 'No' && s.is_trial) return false
        if (category !== 'All' && s.category !== category) return false
        if (cycle !== 'All' && s.billing_cycle !== cycle) return false
        return true
    })

    if (sortBy === 'cost') {
        // highest cost first
        result.sort((a, b) => Number(b.cost) - Number(a.cost))
    } else {
        // soonest billing date first (dates are YYYY-MM-DD, so text order works)
        result.sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date))
    }

    return result
}