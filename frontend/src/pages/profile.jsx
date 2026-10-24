import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'


function Profile() {
    const [fullName, setFullName] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [physicalAddress, setPhysicalAddress] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    // Load the user's profile when the page first opens
    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        setLoading(true)
        setError('')

        // Get the currently logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            setError('You must be logged in to view this page')
            setLoading(false)
            return
        }

        setEmail(user.email)

        // Try to fetch an existing profile row for this user
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile) {
            setFullName(profile.full_name || '')
            setDisplayName(profile.display_name || '')
            setPhysicalAddress(profile.physical_address || '')
        } else {
            // No profile row yet (first time visiting this page) — that's fine,
            // we'll create one when they save. Pre-fill full name from signup metadata if available.
            setFullName(user.user_metadata?.full_name || '')
        }

        setLoading(false)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setSaving(true)

        const { data: { user } } = await supabase.auth.getUser()

        // "Upsert" = update if a profile row already exists, insert if it doesn't
        const { error: saveError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: fullName,
                display_name: displayName,
                physical_address: physicalAddress,
            })

        setSaving(false)

        if (saveError) {
            setError('Failed to save profile: ' + saveError.message)
        } else {
            setMessage('Profile updated successfully!')
        }
    }

    if (loading) {
        return (
            <div className="auth-container">
                <p>Loading profile...</p>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="brand">
                <div className="brand-icon">🎯</div>
                <h1>Subscription Sniper</h1>
            </div>
            <h2>Your Profile</h2>
            <p className="auth-subtitle">View and update your account details</p>
            <form onSubmit={handleSave}>
                <input
                    type="email"
                    value={email}
                    disabled
                    style={{ background: '#f1f5f9', color: '#94a3b8' }}
                />
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Physical Address"
                    value={physicalAddress}
                    onChange={(e) => setPhysicalAddress(e.target.value)}
                />
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
            <p><a onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Back to Dashboard</a></p>
        </div>
    )
}
export default Profile

