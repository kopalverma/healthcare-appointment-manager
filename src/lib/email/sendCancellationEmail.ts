import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCancellationEmail(bookingId: string) {
    try {
        const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { patient: { include: { user: true } }, doctor: { include: { user: true } }, slot: true },
        })
        if (!booking) return

        await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: booking.patient.user.email,
        subject: 'Appointment Cancelled',
        html: `<p>Hi ${booking.patient.user.name},</p>
            <p>Your appointment with Dr. ${booking.doctor.user.name} on
            ${booking.slot.startTime.toLocaleString()} has been cancelled due to doctor unavailability.
            Please rebook at your convenience.</p>`,
        })

        await prisma.notificationLog.create({ data: { bookingId, type: 'CANCELLATION', status: 'SENT' } })
    } catch (error) {
        console.error('Cancellation email error:', error)
        await prisma.notificationLog.create({
        data: { bookingId, type: 'CANCELLATION', status: 'FAILED', errorMessage: String(error) },
        })
    }
}