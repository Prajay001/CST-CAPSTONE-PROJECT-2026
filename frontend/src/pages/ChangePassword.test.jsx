import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../supabaseClient', () => ({
    supabase: { auth: { updateUser: vi.fn() } },
}))

import ChangePassword from './ChangePassword'

function renderPage() {
    render(
        <MemoryRouter>
            <ChangePassword />
        </MemoryRouter>
    )
}

describe('Change Password page', () => {
    it('TC-FE-08a: shows an error when passwords do not match', () => {
        renderPage()
        fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'P@ssword1' } })
        fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'P@ssword2' } })
        fireEvent.click(screen.getByRole('button', { name: /change password/i }))
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    it('TC-FE-08b: rejects a weak password', () => {
        renderPage()
        fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'password' } })
        fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'password' } })
        fireEvent.click(screen.getByRole('button', { name: /change password/i }))
        expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument()
    })
})