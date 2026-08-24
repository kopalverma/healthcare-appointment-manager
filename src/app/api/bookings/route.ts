import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase/admin'
import { generatePreVisitSummary } from '@/lib/llm/preVisitSummary'
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation'

export async function POST(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get('session')?.value
        if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const decoded = await adminAuth.verifySessionCookie(sessionCookie)
        if (decoded.role !== 'PATIENT') {
        return NextResponse.json({ error: 'Only patients can book' }, { status: 403 })
        }

        const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: decoded.uid } })
        if (!patientProfile) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })

        const { slotId, symptoms } = await req.json()

        const booking = await prisma.$transaction(async (tx) => {
        const hold = await tx.slotHold.findUnique({ where: { slotId } })

        if (!hold) throw new Error('NO_HOLD')
        if (hold.patientId !== patientProfile.id) throw new Error('NOT_YOUR_HOLD')
        if (hold.expiresAt < new Date()) throw new Error('HOLD_EXPIRED')

        const slot = await tx.slot.findUnique({ where: { id: slotId } })
        if (!slot) throw new Error('SLOT_NOT_FOUND')

        const newBooking = await tx.booking.create({
            data: {
            slotId,
            patientId: patientProfile.id,
            doctorId: slot.doctorId,
            symptoms,
            },
        })

        await tx.slot.update({ where: { id: slotId }, data: { status: 'BOOKED' } })
        await tx.slotHold.delete({ where: { slotId } })

        return newBooking
        })

        const summaryResult = await generatePreVisitSummary(symptoms)

        if (summaryResult.success && summaryResult.data) {
        await prisma.booking.update({
            where: { id: booking.id },
            data: {
            urgencyLevel: summaryResult.data.urgencyLevel,
            chiefComplaint: summaryResult.data.chiefComplaint,
            suggestedQuestions: { set: summaryResult.data.suggestedQuestions },
            preVisitSummaryStatus: 'success',
            },
        })
        } else {
        await prisma.booking.update({
            where: { id: booking.id },
            data: { preVisitSummaryStatus: 'failed' },
        })
        }
        await sendBookingConfirmation(booking.id)

        return NextResponse.json({ success: true, booking })
    } catch (error: any) {
        console.error('Booking error:', error)
        if (error.message === 'NO_HOLD') return NextResponse.json({ error: 'No active hold on this slot. Please select the slot again.' }, { status: 409 })
        if (error.message === 'NOT_YOUR_HOLD') return NextResponse.json({ error: 'This slot is held by someone else' }, { status: 403 })
        if (error.message === 'HOLD_EXPIRED') return NextResponse.json({ error: 'Your hold expired. Please select the slot again.' }, { status: 409 })
        return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
    }
}