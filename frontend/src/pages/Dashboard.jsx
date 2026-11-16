import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { daysUntilBilling, describeDueDate } from '../utils/alerts'
import logo from '../assets/logo-icon.svg'
import '../styles/app-pages.css'

const CATEGORY_COLORS = [
    '#15803d',
    '#0369a1',
    '#d97706',
    '#7c3aed',
    '#be123c',
    '#0d9488',
    '#475569',
]

const EMPTY_SUMMARY = {
    monthly_burn_rate: 0,
    yearly_projection: 0,
    subscription_count: 0,
    categories: [],
    alerts: [],
}

// Builds the conic-gradient text that draws the donut slices
function buildDonutGradient(rows) {
    let start = 0
    const parts = rows.map((row, index) => {
        const isLast = index === rows.length - 1
        const end = isLast ? 100 : start + Number(row.percent)
        const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        const part = `${color} ${start}% ${end}%`
        start = end
        return part
    })
    return `conic-gradient(${parts.join(', ')})`
}

function Dashboard() {
    const navigate = useNavigate()
    const [summary, setSummary] = useState(EMPTY_SUMMARY)
    const [loadError, setLoadError] = useState('')
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        async function loadSummary() {
            const { data: sessionData } = await supabase.auth.getSession()
            if (!sessionData.session) {
                navigate('/login')
                return
            }

            // One SQL function (dashboard_summary) calculates everything
            const { data, error } = await supabase.rpc('dashboard_summary')

            if (error) {
                console.error('Dashboard load error:', error)
                setLoadError('Could not load your subscription totals.')
            } else {
                setSummary({ ...EMPTY_SUMMARY, ...data })
            }
            setLoaded(true)
        }
        loadSummary()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const monthlyBurnRate = Number(summary.monthly_burn_rate)
    const yearlyProjection = Number(summary.yearly_projection)
    const subscriptionCount = Number(summary.subscription_count)
    const alertSubscriptions = summary.alerts
    const categoryRows = summary.categories
    const categoryTotal = categoryRows.reduce(
        (sum, row) => sum + Number(row.monthly_cost),
        0
    )

    return (
        <div className="sn-page">
            <header className="sn-header">
                <div className="sn-brand">
                    <img src={logo} alt="" width="36" height="36" />
                    <h1 className="sn-title">Subscription Sniper</h1>
                </div>
                <nav className="sn-nav" aria-label="Main navigation">
                    <button className="sn-btn" onClick={() => navigate('/subscriptions')}>
                        My Subscriptions
                    </button>
                    <button
                        className="sn-btn sn-btn-secondary"
                        onClick={() => navigate('/profile')}
                    >
                        Profile
                    </button>
                    <button
                        className="sn-btn sn-btn-secondary"
                        onClick={() => navigate('/change-password')}
                    >
                        Change Password
                    </button>
                    <button
                        className="sn-btn sn-btn-secondary"
                        onClick={() => navigate('/admin')}
                    >
                        Admin
                    </button>
                    <button className="sn-btn sn-btn-danger" onClick={handleLogout}>
                        Log Out
                    </button>
                </nav>
            </header>

            <h2 className="sn-heading">Dashboard</h2>
            <p className="sn-subtitle">See what your subscriptions really cost you.</p>

            {loadError && <p className="sn-error">{loadError}</p>}

            {alertSubscriptions.length > 0 && (
                <div className="sn-alert" role="alert">
                    <strong>
                        48-hour alert: {alertSubscriptions.length} subscription
                        {alertSubscriptions.length > 1 ? 's' : ''} billing soon
                    </strong>
                    <ul>
                        {alertSubscriptions.map((s) => (
                            <li key={s.id}>
                                {s.service_name} (${Number(s.cost).toFixed(2)}) bills{' '}
                                {describeDueDate(daysUntilBilling(s.next_billing_date))} (
                                {s.next_billing_date})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="sn-stats">
                <div className="sn-stat sn-stat-primary">
                    <p className="sn-stat-label">Monthly Burn Rate</p>
                    <p className="sn-stat-value">${monthlyBurnRate.toFixed(2)}</p>
                    <p className="sn-stat-note">spent every month</p>
                </div>
                <div className="sn-stat">
                    <p className="sn-stat-label">Yearly Projection</p>
                    <p className="sn-stat-value">${yearlyProjection.toFixed(2)}</p>
                    <p className="sn-stat-note">if nothing changes</p>
                </div>
                <div className="sn-stat">
                    <p className="sn-stat-label">Subscriptions</p>
                    <p className="sn-stat-value">{subscriptionCount}</p>
                    <p className="sn-stat-note">being tracked</p>
                </div>
            </div>

            {categoryTotal > 0 && (
                <section className="sn-card" aria-label="Spending by category">
                    <h3 className="sn-subheading">Spending by category</h3>
                    <div className="sn-chart">
                        <div
                            className="sn-donut"
                            style={{ background: buildDonutGradient(categoryRows) }}
                            role="img"
                            aria-label={`Monthly spending by category: ${categoryRows
                                .map(
                                    (r) =>
                                        `${r.category} $${Number(r.monthly_cost).toFixed(2)}`
                                )
                                .join(', ')}`}
                        >
                            <div className="sn-donut-hole">
                                <span className="sn-donut-total">
                                    ${categoryTotal.toFixed(2)}
                                </span>
                                <span className="sn-donut-label">per month</span>
                            </div>
                        </div>

                        <ul className="sn-legend">
                            {categoryRows.map((row, index) => (
                                <li key={row.category}>
                                    <span
                                        className="sn-swatch"
                                        style={{
                                            background:
                                                CATEGORY_COLORS[
                                                index % CATEGORY_COLORS.length
                                                ],
                                        }}
                                    />
                                    <span className="sn-legend-name">{row.category}</span>
                                    <span className="sn-legend-value">
                                        ${Number(row.monthly_cost).toFixed(2)} (
                                        {Number(row.percent).toFixed(0)}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {loaded && !loadError && subscriptionCount === 0 && (
                <div className="sn-card sn-empty">
                    <p>You have no subscriptions yet.</p>
                    <button className="sn-btn" onClick={() => navigate('/subscriptions')}>
                        Add your first subscription
                    </button>
                </div>
            )}
        </div>
    )
}

export default Dashboard