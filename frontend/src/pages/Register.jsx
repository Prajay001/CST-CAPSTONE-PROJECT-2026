import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-icon.svg'
import '../styles/auth-pages.css'

// Password policy: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
export function validatePassword(password) {
    if (password.length < 8) {
        return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Password must contain at least one special character'
    }
    return null // valid
}

function Register() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')

        if (!fullName.trim()) {
            setError('Full name is required')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            setError(passwordError)
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })
        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setPassword('')
            setConfirmPassword('')
            setSuccess(true)
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-layout">
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

                    <h2 className="auth-title">Create your account</h2>

                    {success ? (
                        <div className="auth-success" role="status">
                            Registration successful! Please check your email to confirm
                            your account, then log in.
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={handleRegister}>
                            <label className="auth-field">
                                Full Name
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </label>
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
                            <label className="auth-field">
                                Password
                                <input
                                    className="auth-input"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </label>
                            <label className="auth-field">
                                Confirm password
                                <input
                                    className="auth-input"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </label>
                            <p className="auth-hint">
                                Must be 8+ characters with uppercase, lowercase, number, and
                                special character
                            </p>
                            {error && (
                                <p className="auth-error error" role="alert">
                                    {error}
                                </p>
                            )}
                            <button className="auth-button" type="submit" disabled={loading}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    <div className="auth-links">
                        <span>
                            Already have an account?{' '}
                            <Link className="auth-link" to="/login">
                                Log in
                            </Link>
                        </span>
                    </div>
                </div>

                <aside className="auth-hero">
                    <h2 className="auth-hero-title">Take control of your subscriptions</h2>
                    <p className="auth-hero-text">
                        Create a free account and see exactly what you pay for every month.
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

export default Register