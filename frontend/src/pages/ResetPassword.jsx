import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { validatePassword } from './Register'

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
        <div className="auth-container">
            <div className="brand">
                <div className="brand-icon">🎯</div>
                <h1>Subscription Sniper</h1>
            </div>
            <h2>Set a new password</h2>

            {!ready ? (
                <>
                    <p className="auth-subtitle">
                        This page only works from the link in your reset email.
                    </p>
                    <p><Link to="/forgot-password">Request a new reset link</Link></p>
                </>
            ) : (
                <>
                    <p className="auth-subtitle">Enter your new password below</p>
                    <form onSubmit={handleReset}>
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {error && <p className="error">{error}</p>}
                        {message && <p className="success">{message}</p>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}

export default ResetPassword