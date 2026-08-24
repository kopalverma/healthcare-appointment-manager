import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
    // 1. Basic protection so randoms can't trigger mass emails by guessing the URL
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // 2. Find every prescription item whose treatment window is still active
    //    i.e. createdAt + durationDays hasn't passed yet
    const activeItems = await prisma.prescriptionItem.findMany({
        include: {
        booking: {
            include: { patient: { include: { user: true } } },
        },
        },
    })

    const stillActive = activeItems.filter((item) => {
        const endDate = new Date(item.createdAt)
        endDate.setDate(endDate.getDate() + item.durationDays)
        return endDate >= new Date()
    })

    // 3. Group by booking, since one booking can have multiple medicines
    const byBooking = new Map<string, typeof stillActive>()
    for (const item of stillActive) {
        const list = byBooking.get(item.bookingId) ?? []
        list.push(item)
        byBooking.set(item.bookingId, list)
    }

    let sentCount = 0

    for (const [bookingId, items] of byBooking) {
        // 4. Don't double-send if we already reminded this booking today
        const alreadySentToday = await prisma.notificationLog.findFirst({
        where: {
            bookingId,
            type: 'MEDICATION_REMAINDER',
            createdAt: { gte: todayStart },
        },
        })
        if (alreadySentToday) continue

        const patient = items[0].booking.patient
        const medicineList = items
        .map((i) => `${i.medicineName} — ${i.frequency}`)
        .join('<br/>')

        try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: patient.user.email,
            subject: 'Medication Reminder',
            html: `<p>Hi ${patient.user.name},</p>
                <p>This is your reminder to take today's medication:</p>
                <p>${medicineList}</p>`,
        })

        await prisma.notificationLog.create({
            data: { bookingId, type: 'MEDICATION_REMAINDER', status: 'SENT' },
        })
        sentCount++
        } catch (error) {
        console.error('Reminder email error:', error)
        await prisma.notificationLog.create({
            data: {
            bookingId,
            type: 'MEDICATION_REMAINDER',
            status: 'FAILED',
            errorMessage: String(error),
            },
        })
        }
    }

    return NextResponse.json({ success: true, sent: sentCount })
}