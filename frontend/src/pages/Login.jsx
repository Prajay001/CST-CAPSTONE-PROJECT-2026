import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import logo from '../assets/logo-icon.svg'
import '../styles/auth-pages.css'

function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        setLoading(false)

        if (loginError) {
            // Generic message on purpose, so we never reveal whether the
            // email or the password was wrong
            setError('Invalid credentials')
            return
        }

        navigate('/dashboard')
    }

    return (
        <main className="auth-page">
            <div className="auth-layout">
                <div className="auth-card">
                    <img className="auth-logo" src={logo} alt="" width="56" height="56" />
                    <h1 className="auth-brand">Subscription Sniper</h1>
                    <p className="auth-tagline">
                        Track your subscriptions. Stop surprise charges.
                    </p>

                    <h2 className="auth-title">Log in</h2>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="auth-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                className="auth-input"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                className="auth-input"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p className="auth-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <div className="auth-links">
                        <Link className="auth-link" to="/forgot-password">
                            Forgot your password?
                        </Link>
                        <span>
                            New here?{' '}
                            <Link className="auth-link" to="/register">
                                Create an account
                            </Link>
                        </span>
                    </div>
                </div>

                <aside className="auth-hero" aria-label="About Subscription Sniper">
                    <h2 className="auth-hero-title">Never be surprised by a charge again</h2>
                    <p className="auth-hero-text">
                        Keep all your recurring subscriptions in one place and see
                        what is about to bill before it happens.
                    </p>
                    <ul className="auth-features">
                        <li>48-hour alerts before a bill is due</li>
                        <li>Monthly burn rate and yearly projection</li>
                        <li>Search, filter and sort all your subscriptions</li>
                    </ul>
                </aside>
            </div>
        </main>
    )
}

export default Login