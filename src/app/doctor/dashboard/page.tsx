'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, User } from 'lucide-react'

type Booking = {
    id: string
    symptoms: string | null
    urgencyLevel: string | null
    chiefComplaint: string | null
    suggestedQuestions: string[]
    patient: { user: { name: string } }
    slot: { startTime: string }
    }

    const urgencyStyles: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }

    export default function DoctorDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/doctor/bookings').then(r => r.json()).then(d => {
        setBookings(d.bookings || [])
        setLoading(false)
        })
    }, [])

    return (
        <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Your Appointments</h1>
            <p className="text-slate-500 mb-8">Pre-visit summaries generated from patient-reported symptoms.</p>

            {loading ? (
            <p className="text-slate-400">Loading...</p>
            ) : bookings.length === 0 ? (
            <p className="text-slate-400">No appointments booked yet.</p>
            ) : (
            <div className="space-y-4">
                {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <User size={16} />
                        </div>
                        <div>
                        <p className="font-semibold text-slate-900">{b.patient.user.name}</p>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} /> {new Date(b.slot.startTime).toLocaleString()}
                        </span>
                        </div>
                    </div>
                    {b.urgencyLevel && (
                        <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${urgencyStyles[b.urgencyLevel]}`}>
                        {b.urgencyLevel === 'HIGH' && <AlertTriangle size={12} />}
                        {b.urgencyLevel}
                        </span>
                    )}
                    </div>

                    <p className="text-sm text-slate-600 mb-3"><span className="font-medium text-slate-900">Chief complaint:</span> {b.chiefComplaint || b.symptoms}</p>

                    {b.suggestedQuestions?.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-slate-500 mb-2">SUGGESTED QUESTIONS</p>
                        <ul className="space-y-1">
                        {b.suggestedQuestions.map((q, i) => (
                            <li key={i} className="text-sm text-slate-600">• {q}</li>
                        ))}
                        </ul>
                    </div>
                    )}
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    )
}