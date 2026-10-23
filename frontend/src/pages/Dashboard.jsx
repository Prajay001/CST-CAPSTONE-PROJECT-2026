import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
    calculateMonthlyBurnRate,
    calculateYearlyProjection,
} from '../utils/calculations'
import {
    getAlertSubscriptions,
    daysUntilBilling,
    describeDueDate,
} from '../utils/alerts'
import '../styles/app-pages.css'

function Dashboard() {
    const navigate = useNavigate()
    const [subscriptions, setSubscriptions] = useState([])
    const [loadError, setLoadError] = useState('')
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        async function loadSubscriptions() {
            const { data: sessionData } = await supabase.auth.getSession()
            if (!sessionData.session) {
                navigate('/login')
                return
            }

            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')

            if (error) {
                console.error('Dashboard load error:', error)
                setLoadError('Could not load your subscription totals.')
            } else {
                setSubscriptions(data)
            }
            setLoaded(true)
        }
        loadSubscriptions()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const monthlyBurnRate = calculateMonthlyBurnRate(subscriptions)
    const yearlyProjection = calculateYearlyProjection(subscriptions)
    const alertSubscriptions = getAlertSubscriptions(subscriptions)

    return (
        <div className="sn-page">
            <header className="sn-header">
                <h1 className="sn-title">Subscription Sniper</h1>
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

            {loadError && <p className="error">{loadError}</p>}

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
                <div className="sn-stat">
                    <p className="sn-stat-label">Monthly Burn Rate</p>
                    <p className="sn-stat-value">${monthlyBurnRate.toFixed(2)}</p>
                </div>
                <div className="sn-stat">
                    <p className="sn-stat-label">Yearly Projection</p>
                    <p className="sn-stat-value">${yearlyProjection.toFixed(2)}</p>
                </div>
                <div className="sn-stat">
                    <p className="sn-stat-label">Subscriptions</p>
                    <p className="sn-stat-value">{subscriptions.length}</p>
                </div>
            </div>

            {loaded && !loadError && subscriptions.length === 0 && (
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