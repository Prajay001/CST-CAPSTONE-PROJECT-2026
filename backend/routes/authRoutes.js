import express from 'express'
import { supabaseAdmin } from '../config/supabaseAdmin.js'

const router = express.Router()

// POST register
router.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Full name, email, and password are required' })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
    })

    if (error) {
        if (error.message.toLowerCase().includes('already')) {
            return res.status(409).json({ error: 'Email already registered' })
        }
        return res.status(400).json({ error: 'Registration failed' })
    }

    return res.status(201).json({ message: 'User created', userId: data.user.id })
})

// POST login
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    return res.status(200).json({
        message: 'Login successful',
        token: data.session.access_token,
    })
})

// POST logout
router.post('/logout', async (req, res) => {
    const { error } = await supabaseAdmin.auth.signOut()

    if (error) {
        return res.status(400).json({ error: 'Logout failed' })
    }

    return res.status(200).json({ message: 'Logged out successfully' })
})

// POST reset password
router.post('/reset', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ error: 'Email is required' })
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email)

    if (error) {
        return res.status(400).json({ error: 'Failed to send reset email' })
    }

    return res.status(200).json({ message: 'Reset email sent' })
})

export default router