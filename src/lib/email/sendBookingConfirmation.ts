import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(bookingId: string) {
    try {
        const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
            slot: true,
        },
        })
        if (!booking) return

        await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: booking.patient.user.email,
        subject: 'Appointment Confirmed',
        html: `<p>Hi ${booking.patient.user.name},</p>
            <p>Your appointment with Dr. ${booking.doctor.user.name} is confirmed for
            ${booking.slot.startTime.toLocaleString()}.</p>
            <p>Chief complaint noted: ${booking.chiefComplaint || 'Pending review'}</p>`,
        })

        await prisma.notificationLog.create({
        data: { bookingId, type: 'BOOKING_CONFIRMATION', status: 'SENT' },
        })
    } catch (error) {
        console.error('Email send error:', error)
        await prisma.notificationLog.create({
        data: { bookingId, type: 'BOOKING_CONFIRMATION', status: 'FAILED', errorMessage: String(error) },
        })
    }
}