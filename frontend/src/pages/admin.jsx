import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Admin() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        checkAdminAndLoadUsers()
    }, [])

    const checkAdminAndLoadUsers = async () => {
        setLoading(true)
        setError('')

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            navigate('/login')
            return
        }

        // Check if the current user is an admin
        const { data: myProfile } = await supabase
            .from('profiles')
            .select('Role')
            .eq('id', user.id)
            .single()

        if (!myProfile || myProfile.Role !== 'admin') {
            setIsAdmin(false)
            setError('You do not have permission to view this page')
            setLoading(false)
            return
        }

        setIsAdmin(true)

        // Fetch all profiles (RLS policy allows this only because we're an admin)
        const { data: allProfiles, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (fetchError) {
            setError('Failed to load users: ' + fetchError.message)
        } else {
            setUsers(allProfiles)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p className="error" style={{ display: 'inline-block' }}>{error}</p>
                <br />
                <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <h1>Admin — User Management</h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                {users.length} registered user{users.length !== 1 ? 's' : ''}
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Full Name</th>
                        <th style={{ padding: '12px' }}>Display Name</th>
                        <th style={{ padding: '12px' }}>Role</th>
                        <th style={{ padding: '12px' }}>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}>{u.full_name || '—'}</td>
                            <td style={{ padding: '12px' }}>{u.display_name || '—'}</td>
                            <td style={{ padding: '12px' }}>{u.Role || 'user'}</td>
                            <td style={{ padding: '12px' }}>
                                {new Date(u.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '24px' }}>
                Back to Dashboard
            </button>
        </div>
    )
}

export default Admin