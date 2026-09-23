import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Dashboard() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Dashboard (coming soon)</h1>
            <button
                onClick={handleLogout}
                style={{
                    padding: '10px 20px',
                    background: '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px',
                }}
            >
                Log Out
            </button>
        </div>
    )
}

export default Dashboard