'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export default function LoginPage() {
    const router = useRouter()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
        const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password)
        const idToken = await userCredential.user.getIdToken()

        const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error || 'Login failed')
            setLoading(false)
            return
        }

        if (data.role === 'DOCTOR') router.push('/doctor/dashboard')
        else if (data.role === 'ADMIN') router.push('/admin/dashboard')
        else router.push('/patient/dashboard')
        } catch (err) {
        setError('Invalid email or password')
        setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16 p-6">
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            required
            />
            <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            required
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md py-2 disabled:opacity-50"
            >
            {loading ? 'Logging in...' : 'Log in'}
            </button>
        </form>
        </div>
    )
}