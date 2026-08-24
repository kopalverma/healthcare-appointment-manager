'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, User, Mail, Lock } from 'lucide-react'

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
        } catch {
        setError('Something went wrong. Try again.')
        setLoading(false)
        }
    }

    const inputClass = "w-full border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
            <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="text-white" size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Book appointments in minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="text" placeholder="Full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass} required />
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="email" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass} required />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="password" placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass} required minLength={6} />
            </div>

            <div className="flex gap-2">
                {['PATIENT', 'DOCTOR'].map((r) => (
                <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.role === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                >
                    {r === 'PATIENT' ? 'I\'m a Patient' : 'I\'m a Doctor'}
                </button>
                ))}
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

            <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-2.5 rounded-xl transition-colors">
                {loading ? 'Creating account...' : 'Sign up'}
            </button>

            <p className="text-center text-sm text-slate-500">
                Already have an account? <Link href="/login" className="text-blue-600 font-medium">Log in</Link>
            </p>
            </form>
        </div>
        </div>
    )
}