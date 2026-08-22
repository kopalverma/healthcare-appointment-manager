'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PATIENT' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error || 'Signup failed')
            setLoading(false)
            return
        }

        router.push('/login')
        } catch (err) {
        setError('Something went wrong. Try again.')
        setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16 p-6">
        <h1 className="text-2xl font-semibold mb-6">Create an account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            required
            />
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
            minLength={6}
            />
            <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            >
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            </select>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md py-2 disabled:opacity-50"
            >
            {loading ? 'Creating account...' : 'Sign up'}
            </button>
        </form>
        </div>
    )
}