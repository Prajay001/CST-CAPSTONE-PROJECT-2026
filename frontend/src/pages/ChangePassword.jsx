import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { validatePassword } from './Register'

function ChangePassword() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

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
        <div className="auth-container">
            <div className="brand">
                <div className="brand-icon">🎯</div>
                <h1>Subscription Sniper</h1>
            </div>
            <h2>Change Password</h2>
            <p className="auth-subtitle">Enter your new password below</p>
            <form onSubmit={handleChangePassword}>
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
                    {loading ? 'Updating...' : 'Change Password'}
                </button>
            </form>
            <p><a onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Back to Dashboard</a></p>
        </div>
    )
}

export default ChangePassword