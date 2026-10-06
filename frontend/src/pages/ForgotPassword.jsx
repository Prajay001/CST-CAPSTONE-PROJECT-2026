import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleReset = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setMessage('Check your inbox. We sent you a password reset link.')
        }
    }

    return (
        <div className="auth-container">
            <div className="brand">
                <div className="brand-icon">🎯</div>
                <h1>Subscription Sniper</h1>
                <p className="brand-tagline">Never get charged by surprise again</p>
            </div>
            <h2>Reset your password</h2>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>
            <form onSubmit={handleReset}>
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            <p><Link to="/login">Back to login</Link></p>
        </div>
    )
}

export default ForgotPassword