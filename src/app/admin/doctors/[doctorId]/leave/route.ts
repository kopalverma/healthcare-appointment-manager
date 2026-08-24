import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCancellationEmail } from '@/lib/email/sendCancellationEmail'

export async function POST(req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
    try {
        const { doctorId } = await params
        const { date, reason } = await req.json()

        const leaveDate = new Date(date)
        const dayStart = new Date(leaveDate.setHours(0, 0, 0, 0))
        const dayEnd = new Date(leaveDate.setHours(23, 59, 59, 999))

        await prisma.leaveDay.create({ data: { doctorId, date: dayStart, reason } })

        const affectedSlots = await prisma.slot.findMany({
        where: { doctorId, startTime: { gte: dayStart, lte: dayEnd } },
        include: { booking: { include: { patient: { include: { user: true } } } } },
        })

        let cancelledCount = 0
        for (const slot of affectedSlots) {
        if (slot.booking) {
            await prisma.booking.update({ where: { id: slot.booking.id }, data: { status: 'CANCELLED' } })
            await sendCancellationEmail(slot.booking.id)
            cancelledCount++
        }
        await prisma.slot.update({ where: { id: slot.id }, data: { status: 'CANCELLED' } })
        }

        return NextResponse.json({ success: true, affectedBookings: cancelledCount })
    } catch (error) {
        console.error('Leave day error:', error)
        return NextResponse.json({ error: 'Failed to mark leave day' }, { status: 500 })
    }
}