import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-icon.svg'
import '../styles/auth-pages.css'

function Profile() {
    const [fullName, setFullName] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [physicalAddress, setPhysicalAddress] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // Load the user's profile when the page first opens
    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        setLoading(true)
        setError('')

        // Get the currently logged-in user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setError('You must be logged in to view this page')
            setLoading(false)
            return
        }

        setEmail(user.email)

        // Try to fetch an existing profile row for this user
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile) {
            setFullName(profile.full_name || '')
            setDisplayName(profile.display_name || '')
            setPhysicalAddress(profile.physical_address || '')
        } else {
            // No profile row yet (first visit): pre-fill the name from signup
            setFullName(user.user_metadata?.full_name || '')
        }

        setLoading(false)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setSaving(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // "Upsert" = update if a profile row already exists, insert if it doesn't
        const { error: saveError } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: fullName,
            display_name: displayName,
            physical_address: physicalAddress,
        })

        setSaving(false)

        if (saveError) {
            console.error('Profile save error:', saveError)
            setError('Could not save your profile. Please try again.')
        } else {
            setMessage('Profile updated successfully!')
        }
    }

    if (loading) {
        return (
            <main className="auth-page">
                <p role="status">Loading profile...</p>
            </main>
        )
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
                    <p className="auth-tagline">View and update your account details</p>

                    <h2 className="auth-title">Your Profile</h2>

                    <form className="auth-form" onSubmit={handleSave}>
                        <label className="auth-field">
                            Email (cannot be changed)
                            <input
                                className="auth-input"
                                type="email"
                                value={email}
                                disabled
                            />
                        </label>
                        <label className="auth-field">
                            Full name
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </label>
                        <label className="auth-field">
                            Display name
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </label>
                        <label className="auth-field">
                            Physical address
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="Physical Address"
                                value={physicalAddress}
                                onChange={(e) => setPhysicalAddress(e.target.value)}
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

                        <button className="auth-button" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
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

export default Profile