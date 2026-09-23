import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'


function ForgotPassword() {
    const [email, setaEmail] = useState('')
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
            setMessage('Password reset link sent! Check your email.')
        }
    }


    return (
        <div className="auth-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleReset}>
                <input
                    type="email"
                    placeholder="Email"
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
            <p><Link to="/login">Back to Login</Link></p>
        </div>
    )
}

export default ForgotPassword
