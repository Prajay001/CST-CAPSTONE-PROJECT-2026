import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
    calculateMonthlyBurnRate,
    calculateYearlyProjection,
} from '../utils/calculations'

function Dashboard() {
    const navigate = useNavigate()
    const [subscriptions, setSubscriptions] = useState([])
    const [loadError, setLoadError] = useState('')

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
                return
            }
            setSubscriptions(data)
        }
        loadSubscriptions()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const monthlyBurnRate = calculateMonthlyBurnRate(subscriptions)
    const yearlyProjection = calculateYearlyProjection(subscriptions)

    const cardStyle = {
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '20px 28px',
        minWidth: '220px',
    }
    const cardLabelStyle = { color: '#075985', fontSize: '0.95rem', margin: 0 }
    const cardValueStyle = { fontSize: '2rem', fontWeight: 'bold', margin: '8px 0 0 0' }

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Dashboard</h1>

            {loadError && <p className="error">{loadError}</p>}

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '20px',
                }}
            >
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Monthly Burn Rate</p>
                    <p style={cardValueStyle}>${monthlyBurnRate.toFixed(2)}</p>
                </div>
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Yearly Projection</p>
                    <p style={cardValueStyle}>${yearlyProjection.toFixed(2)}</p>
                </div>
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Subscriptions</p>
                    <p style={cardValueStyle}>{subscriptions.length}</p>
                </div>
            </div>

            <button
                onClick={() => navigate('/subscriptions')}
                style={{
                    padding: '10px 20px',
                    background: '#047857',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    marginRight: '10px',
                }}
            >
                My Subscriptions
            </button>
            <button
                onClick={() => navigate('/profile')}
                style={{
                    padding: '10px 20px',
                    background: '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    marginRight: '10px',
                }}
            >
                Profile
            </button>
            <button
                onClick={() => navigate('/change-password')}
                style={{
                    padding: '10px 20px',
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    marginRight: '10px',
                }}
            >
                Change Password
            </button>
            <button
                onClick={() => navigate('/admin')}
                style={{
                    padding: '10px 20px',
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    marginRight: '10px',
                }}
            >
                Admin
            </button>
            <button
                onClick={handleLogout}
                style={{
                    padding: '10px 20px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px',
                }}
            >
                Log Out
            </button>
        </div>
    )
}

export default Dashboard