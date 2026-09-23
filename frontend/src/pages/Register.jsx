import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

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
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

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
        const { data, error } = await supabase.auth.signUp({
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
            alert('Registration successful! Please check your email to confirm.')
            navigate('/login')
        }
    }

    return (
        <div className="auth-container">
            <div className="brand">
                <div className="brand-icon">🎯</div>
                <h1>Subscription Sniper</h1>
                <p className="brand-tagline">Never get charged by surprise again</p>
            </div>
            <h2>Create your account</h2>
            <p className="auth-subtitle">Start tracking your subscriptions in minutes</p>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '-8px 0 0' }}>
                    Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    )
}

export default Register