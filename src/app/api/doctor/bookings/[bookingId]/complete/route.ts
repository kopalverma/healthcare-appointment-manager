import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase/admin'
import { generatePostVisitSummary } from '@/lib/llm/postVisitSummary'

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
    try {
        const sessionCookie = req.cookies.get('session')?.value
        if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        await adminAuth.verifySessionCookie(sessionCookie)

        const { bookingId } = await params
        const { doctorNotes, prescription, prescriptionItems } = await req.json()
        // prescriptionItems: [{ medicineName, frequency, durationDays }]

        const summaryResult = await generatePostVisitSummary(doctorNotes, prescription)

        await prisma.booking.update({
        where: { id: bookingId },
        data: {
            doctorNotes,
            prescription,
            status: 'COMPLETED',
            postVisitSummary: summaryResult.success ? summaryResult.data : null,
            postVisitSummaryStatus: summaryResult.success ? 'success' : 'failed',
            prescriptionItems: { create: prescriptionItems ?? [] },
        },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Complete visit error:', error)
        return NextResponse.json({ error: 'Failed to complete visit' }, { status: 500 })
    }
}