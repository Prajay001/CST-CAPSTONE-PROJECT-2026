import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { validatePassword } from './Register'
import logo from '../assets/logo-icon.svg'
import '../styles/auth-pages.css'

function ChangePassword() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        const passwordError = validatePassword(newPassword)
        if (passwordError) {
            setError(passwordError)
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })
        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setMessage('Password changed successfully!')
            setNewPassword('')
            setConfirmPassword('')
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
                    <p className="auth-tagline">Enter your new password below</p>

                    <h2 className="auth-title">Change Password</h2>

                    <form className="auth-form" onSubmit={handleChangePassword}>
                        <label className="auth-field">
                            New password
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </label>
                        <label className="auth-field">
                            Confirm new password
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="Confirm new password"
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
                        {message && (
                            <p className="auth-success success" role="status">
                                {message}
                            </p>
                        )}

                        <button className="auth-button" type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>

                    <div className="auth-links">
                        <Link className="auth-link" to="/dashboard">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ChangePassword