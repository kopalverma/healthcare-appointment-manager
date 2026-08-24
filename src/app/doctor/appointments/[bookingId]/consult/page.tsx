'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'

type Prescription = {
  medicineName: string
  frequency: string
  durationDays: string
}

type Booking = {
  id: string
  symptoms: string | null
  urgencyLevel: string | null
  chiefComplaint: string | null
  suggestedQuestions: string[]
  patient: {
    user: {
      name: string
    }
  }
  slot: {
    startTime: string
  }
}

export default function ConsultationPage() {
  const params = useParams()
  const router = useRouter()

  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [doctorNotes, setDoctorNotes] = useState('')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      medicineName: '',
      frequency: '',
      durationDays: '',
    },
  ])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch('/api/doctor/bookings')

        if (!res.ok) {
          throw new Error('Failed to load appointment')
        }

        const data = await res.json()

        const found = data.bookings?.find(
          (item: Booking) => item.id === bookingId
        )

        if (!found) {
          throw new Error('Appointment not found')
        }

        setBooking(found)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load appointment'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  function addPrescription() {
    setPrescriptions([
      ...prescriptions,
      {
        medicineName: '',
        frequency: '',
        durationDays: '',
      },
    ])
  }

  function removePrescription(index: number) {
    setPrescriptions(
      prescriptions.filter((_, prescriptionIndex) => prescriptionIndex !== index)
    )
  }

  function updatePrescription(
    index: number,
    field: keyof Prescription,
    value: string
  ) {
    setPrescriptions(
      prescriptions.map((prescription, prescriptionIndex) =>
        prescriptionIndex === index
          ? {
              ...prescription,
              [field]: value,
            }
          : prescription
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError('')

    if (!doctorNotes.trim()) {
      setError('Please enter the consultation notes.')
      return
    }

    const validPrescriptions = prescriptions.filter(
      (prescription) =>
        prescription.medicineName.trim() &&
        prescription.frequency.trim() &&
        Number(prescription.durationDays) > 0
    )

    if (validPrescriptions.length === 0) {
      setError('Please add at least one valid prescription.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/doctor/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorNotes,
          prescriptions: validPrescriptions.map((prescription) => ({
            medicineName: prescription.medicineName.trim(),
            frequency: prescription.frequency.trim(),
            durationDays: Number(prescription.durationDays),
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete consultation')
      }

      router.push('/doctor/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to complete consultation'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-500" />
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto bg-white border border-red-200 rounded-2xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to appointments
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Patient Consultation
          </h1>

          <p className="text-slate-500 mt-1">
            Complete the consultation and prescription for this appointment.
          </p>
        </div>

        <div className="space-y-6">
          {/* Patient */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Patient
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              {booking.patient.user.name}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {new Date(booking.slot.startTime).toLocaleString()}
            </p>
          </section>

          {/* AI Visit Brief */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  AI Visit Brief
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  Pre-visit summary
                </h2>
              </div>

              {booking.urgencyLevel && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  {booking.urgencyLevel} URGENCY
                </span>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Chief complaint
                </p>

                <p className="text-sm text-slate-600">
                  {booking.chiefComplaint || booking.symptoms || 'Not provided'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Suggested questions
                </p>

                <ul className="space-y-2">
                  {booking.suggestedQuestions?.map((question, index) => (
                    <li
                      key={index}
                      className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3"
                    >
                      {index + 1}. {question}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Consultation Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Doctor Notes
              </h2>

              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter your consultation notes..."
                rows={7}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 resize-none"
              />
            </section>

            {/* Prescription */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Prescription
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Add medicines prescribed during the consultation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addPrescription}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={16} />
                  Add medicine
                </button>
              </div>

              <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Medicine
                        </label>

                        <input
                          value={prescription.medicineName}
                          onChange={(e) =>
                            updatePrescription(
                              index,
                              'medicineName',
                              e.target.value
                            )
                          }
                          placeholder="e.g. Paracetamol"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Frequency
                        </label>

                        <input
                          value={prescription.frequency}
                          onChange={(e) =>
                            updatePrescription(
                              index,
                              'frequency',
                              e.target.value
                            )
                          }
                          placeholder="e.g. 2 times a day"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Duration
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={prescription.durationDays}
                            onChange={(e) =>
                              updatePrescription(
                                index,
                                'durationDays',
                                e.target.value
                              )
                            }
                            placeholder="3"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                          />

                          {prescriptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePrescription(index)}
                              className="px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3.5 font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting
                ? 'Completing consultation...'
                : 'Complete Consultation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}