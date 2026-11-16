import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { validatePassword } from './Register'
import logo from '../assets/logo-icon.svg'
import '../styles/auth-pages.css'

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [ready, setReady] = useState(false)
    const navigate = useNavigate()

    // When the user clicks the email link, Supabase signs them into a
    // temporary "recovery" session. We wait for that before showing the form.
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setReady(true)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') setReady(true)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const handleReset = async (e) => {
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
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setMessage('Password updated! Redirecting to login...')
            await supabase.auth.signOut()
            setTimeout(() => navigate('/login'), 2000)
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

                    <h2 className="auth-title">Set a new password</h2>

                    {!ready ? (
                        <>
                            <p className="auth-hint">
                                This page only works from the link in your reset email.
                            </p>
                            <div className="auth-links">
                                <Link className="auth-link" to="/forgot-password">
                                    Request a new reset link
                                </Link>
                            </div>
                        </>
                    ) : (
                        <form className="auth-form" onSubmit={handleReset}>
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
                                Must be 8+ characters with uppercase, lowercase, number,
                                and special character
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
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    )
}

export default ResetPassword