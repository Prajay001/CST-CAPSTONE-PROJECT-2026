const MS_PER_DAY = 1000 * 60 * 60 * 24

// How many calendar days from today until the billing date.
// today can be passed in so the function can be tested with a fixed date.
export function daysUntilBilling(dateString, today = new Date()) {
    // dateString looks like "2026-10-22". Build it as a LOCAL date, because
    // new Date("2026-10-22") is read as UTC and can be off by one day.
    const [year, month, day] = dateString.split('-').map(Number)
    const billingDate = new Date(year, month - 1, day)
    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    )
    return Math.round((billingDate - startOfToday) / MS_PER_DAY)
}

// The 48-hour alert: billing today, tomorrow or the day after
export function isAlertDue(dateString, today = new Date()) {
    const days = daysUntilBilling(dateString, today)
    return days >= 0 && days <= 2
}

export function getAlertSubscriptions(subscriptions, today = new Date()) {
    return subscriptions.filter((s) => isAlertDue(s.next_billing_date, today))
}

// Days left before a trial converts to paid. null if it is not a trial.
export function getTrialCountdown(subscription, today = new Date()) {
    if (!subscription.is_trial) return null
    return daysUntilBilling(subscription.next_billing_date, today)
}

// Text shown in the Trial column of the list
export function trialLabel(subscription, today = new Date()) {
    const days = getTrialCountdown(subscription, today)
    if (days === null) return 'No'
    if (days < 0) return 'Yes (ended)'
    if (days === 1) return 'Yes (1 day left)'
    return `Yes (${days} days left)`
}

// Wording used in the dashboard alert
export function describeDueDate(days) {
    if (days === 0) return 'today'
    if (days === 1) return 'tomorrow'
    return `in ${days} days`
}