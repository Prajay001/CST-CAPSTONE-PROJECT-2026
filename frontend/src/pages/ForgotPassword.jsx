import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-icon.svg'
import '../styles/auth-pages.css'

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
            console.error('Reset email error:', error)
            setError('Could not send the reset link. Please try again later.')
        } else {
            setMessage('Check your inbox. We sent you a password reset link.')
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-layout auth-layout-single">
                <div className="auth-card">
                    <img
                        className="auth-logo"
                        src={logo}
                        alt=""
                        width="56"
                        height="56"
                    />
                    <h1 className="auth-brand">Subscription Sniper</h1>
                    <p className="auth-tagline">Never get charged by surprise again</p>

                    <h2 className="auth-title">Reset your password</h2>
                    <p className="auth-hint">
                        Enter your email and we will send you a reset link.
                    </p>

                    <form className="auth-form" onSubmit={handleReset}>
                        <label className="auth-field">
                            Email address
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        {error && (
                            <p className="auth-error error" role="alert">
                                {error}
                            </p>
                        )}
                        {message && (
                            <p className="auth-success success" role="status">
                                {message}
                            </p>
                        )}

                        <button className="auth-button" type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="auth-links">
                        <Link className="auth-link" to="/login">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ForgotPassword