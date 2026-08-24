'use client'

import { useState, useEffect } from 'react'
import { Stethoscope, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

type Slot = { id: string; startTime: string }
type Doctor = { id: string; specialisation: string; user: { name: string }; slots: Slot[] }

export default function PatientDashboard() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [symptoms, setSymptoms] = useState('')
    const [status, setStatus] = useState('')
    const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info')
    const [holding, setHolding] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/doctors').then(r => r.json()).then(d => {
        setDoctors(d.doctors || [])
        setLoading(false)
        })
    }, [])

    async function holdSlot(slotId: string) {
        setStatus('Holding your slot...')
        setStatusType('info')
        const res = await fetch(`/api/slots/${slotId}/hold`, { method: 'POST' })
        const data = await res.json()
        if (res.ok) {
        setSelectedSlot(slotId)
        setHolding(true)
        setStatus('Slot reserved for 5 minutes — describe your symptoms to confirm.')
        setStatusType('info')
        } else {
        setStatus(data.error)
        setStatusType('error')
        }
    }

    async function confirmBooking() {
        setStatus('Confirming your appointment...')
        setStatusType('info')
        const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot, symptoms }),
        })
        const data = await res.json()
        if (res.ok) {
        setStatus('Appointment confirmed! A confirmation email is on its way.')
        setStatusType('success')
        setHolding(false)
        setSelectedSlot(null)
        setSymptoms('')
        } else {
        setStatus(data.error)
        setStatusType('error')
        }
    }

    const statusStyles = {
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    }

    return (
        <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Book an Appointment</h1>
            <p className="text-slate-500 mt-1">Find a doctor and choose a time that works for you.</p>
            </div>

            {status && (
            <div className={`flex items-center gap-2 mb-6 p-4 rounded-xl border text-sm font-medium ${statusStyles[statusType]}`}>
                {statusType === 'success' ? <CheckCircle2 size={18} /> : statusType === 'error' ? <AlertCircle size={18} /> : <Clock size={18} />}
                {status}
            </div>
            )}

            {holding ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h2 className="font-semibold text-slate-900">Tell us what's going on</h2>
                <textarea
                className="w-full border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={5}
                placeholder="e.g. Fever and headache for 2 days, mild sore throat..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                />
                <div className="flex gap-3">
                <button
                    onClick={confirmBooking}
                    disabled={!symptoms.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                    Confirm Appointment
                </button>
                <button
                    onClick={() => { setHolding(false); setSelectedSlot(null) }}
                    className="text-slate-500 hover:text-slate-700 font-medium px-5 py-2.5"
                >
                    Cancel
                </button>
                </div>
            </div>
            ) : loading ? (
            <p className="text-slate-400">Loading doctors...</p>
            ) : doctors.length === 0 ? (
            <p className="text-slate-400">No doctors available right now.</p>
            ) : (
            <div className="space-y-4">
                {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                        {doc.user.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900">Dr. {doc.user.name}</h2>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Stethoscope size={13} /> {doc.specialisation}
                        </span>
                    </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {doc.slots.slice(0, 8).map((slot) => (
                        <button
                        key={slot.id}
                        onClick={() => holdSlot(slot.id)}
                        className="border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors"
                        >
                        {new Date(slot.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </button>
                    ))}
                    {doc.slots.length === 0 && <span className="text-sm text-slate-400">No available slots</span>}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    )
}