import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import logo from '../assets/logo-icon.svg'
import '../styles/app-pages.css'
import '../styles/admin-page.css'

const DEFAULT_DAYS = 30

function formatDate(value) {
    return new Date(value).toLocaleDateString('en-CA')
}

function Admin() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [myId, setMyId] = useState('')
    const [loading, setLoading] = useState(true)
    const [notAdmin, setNotAdmin] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [daysById, setDaysById] = useState({})
    // confirm = { id, type: 'deactivate' | 'delete' } or null
    const [confirm, setConfirm] = useState(null)
    const [busy, setBusy] = useState(false)

    const loadUsers = useCallback(async () => {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
            navigate('/login')
            return
        }
        setMyId(sessionData.session.user.id)

        // SQL function admin_list_users checks is_admin() itself
        const { data, error } = await supabase.rpc('admin_list_users')

        if (error) {
            console.error('Admin load error:', error)
            if (error.code === '42501') {
                setNotAdmin(true)
            } else {
                setMessage({ type: 'error', text: 'Could not load the user list.' })
            }
        } else {
            setUsers(data || [])
        }
        setLoading(false)
    }, [navigate])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    const getDays = (id) => daysById[id] ?? DEFAULT_DAYS

    // Runs one admin SQL function, then refreshes the list
    async function runAction(fnName, args, successText) {
        setBusy(true)
        setMessage({ type: '', text: '' })
        const { error } = await supabase.rpc(fnName, args)
        if (error) {
            console.error(fnName + ' error:', error)
            const safeCodes = ['42501', '22023', 'P0002']
            setMessage({
                type: 'error',
                text: safeCodes.includes(error.code)
                    ? error.message
                    : 'Something went wrong. Please try again.',
            })
        } else {
            setMessage({ type: 'success', text: successText })
            await loadUsers()
        }
        setConfirm(null)
        setBusy(false)
    }

    const handleDeactivate = (user) => {
        const days = Number(getDays(user.user_id))
        runAction(
            'admin_deactivate_user',
            { p_user_id: user.user_id, p_days: days },
            `${user.email} is deactivated for ${days} day${days === 1 ? '' : 's'}.`
        )
    }

    const handleReactivate = (user) =>
        runAction(
            'admin_reactivate_user',
            { p_user_id: user.user_id },
            `${user.email} is active again.`
        )

    const handleDelete = (user) =>
        runAction(
            'admin_delete_user',
            { p_user_id: user.user_id },
            `${user.email} was permanently deleted.`
        )

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <div className="sn-page">
            <header className="sn-header">
                <div className="sn-brand">
                    <img src={logo} alt="" width="36" height="36" />
                    <h1 className="sn-title">Subscription Sniper</h1>
                </div>
                <nav className="sn-nav" aria-label="Main navigation">
                    <button className="sn-btn" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </button>
                    <button
                        className="sn-btn sn-btn-secondary"
                        onClick={() => navigate('/subscriptions')}
                    >
                        My Subscriptions
                    </button>
                    <button className="sn-btn sn-btn-danger" onClick={handleLogout}>
                        Log Out
                    </button>
                </nav>
            </header>

            <h2 className="sn-heading">User Management</h2>
            <p className="sn-subtitle">
                Deactivate a user for a set time, or delete an account permanently.
            </p>

            {message.text && (
                <p
                    className={message.type === 'error' ? 'sn-error' : 'sn-success'}
                    role={message.type === 'error' ? 'alert' : 'status'}
                >
                    {message.text}
                </p>
            )}

            {loading && <p>Loading users...</p>}

            {notAdmin && (
                <div className="sn-card sn-empty">
                    <p>Only administrators can see this page.</p>
                    <button className="sn-btn" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            )}

            {!loading && !notAdmin && (
                <section className="sn-card" aria-label="All users">
                    <p className="admin-count">{users.length} registered users</p>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th scope="col">Email</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Role</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const isMe = user.user_id === myId
                                    const isAdminUser = user.role === 'admin'
                                    const confirming =
                                        confirm && confirm.id === user.user_id
                                            ? confirm.type
                                            : null

                                    return (
                                        <tr key={user.user_id}>
                                            <td>
                                                {user.email}
                                                {isMe && (
                                                    <span className="admin-you"> (you)</span>
                                                )}
                                            </td>
                                            <td>
                                                {user.full_name || user.display_name || '-'}
                                            </td>
                                            <td>{user.role}</td>
                                            <td>
                                                {user.is_deactivated ? (
                                                    <span className="admin-badge admin-badge-off">
                                                        Deactivated until{' '}
                                                        {formatDate(user.banned_until)}
                                                    </span>
                                                ) : (
                                                    <span className="admin-badge admin-badge-on">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {isMe || isAdminUser ? (
                                                    <span className="admin-protected">
                                                        Protected
                                                    </span>
                                                ) : confirming === 'deactivate' ? (
                                                    <div className="admin-confirm">
                                                        <span>
                                                            Deactivate for{' '}
                                                            {getDays(user.user_id)} days?
                                                        </span>
                                                        <button
                                                            className="sn-btn sn-btn-danger"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                handleDeactivate(user)
                                                            }
                                                        >
                                                            Yes, deactivate
                                                        </button>
                                                        <button
                                                            className="sn-btn sn-btn-secondary"
                                                            onClick={() => setConfirm(null)}
                                                            autoFocus
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : confirming === 'delete' ? (
                                                    <div className="admin-confirm">
                                                        <span>
                                                            Permanently delete this user and
                                                            all their subscriptions?
                                                        </span>
                                                        <button
                                                            className="sn-btn sn-btn-danger"
                                                            disabled={busy}
                                                            onClick={() => handleDelete(user)}
                                                        >
                                                            Yes, delete
                                                        </button>
                                                        <button
                                                            className="sn-btn sn-btn-secondary"
                                                            onClick={() => setConfirm(null)}
                                                            autoFocus
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="admin-actions">
                                                        {user.is_deactivated ? (
                                                            <button
                                                                className="sn-btn"
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    handleReactivate(user)
                                                                }
                                                            >
                                                                Reactivate
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <label
                                                                    className="admin-days"
                                                                    htmlFor={`days-${user.user_id}`}
                                                                >
                                                                    Days
                                                                </label>
                                                                <input
                                                                    id={`days-${user.user_id}`}
                                                                    className="admin-days-input"
                                                                    type="number"
                                                                    min="1"
                                                                    max="3650"
                                                                    value={getDays(
                                                                        user.user_id
                                                                    )}
                                                                    onChange={(e) =>
                                                                        setDaysById({
                                                                            ...daysById,
                                                                            [user.user_id]:
                                                                                e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <button
                                                                    className="sn-btn sn-btn-secondary"
                                                                    disabled={busy}
                                                                    onClick={() =>
                                                                        setConfirm({
                                                                            id: user.user_id,
                                                                            type: 'deactivate',
                                                                        })
                                                                    }
                                                                >
                                                                    Deactivate
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            className="sn-btn sn-btn-danger"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                setConfirm({
                                                                    id: user.user_id,
                                                                    type: 'delete',
                                                                })
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}

export default Admin