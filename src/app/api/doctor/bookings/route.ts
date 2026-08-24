import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get('session')?.value
        if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        const decoded = await adminAuth.verifySessionCookie(sessionCookie)

        const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: decoded.uid } })
        if (!doctorProfile) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

        const bookings = await prisma.booking.findMany({
        where: { doctorId: doctorProfile.id },
        include: { patient: { include: { user: true } }, slot: true },
        orderBy: { slot: { startTime: 'asc' } },
        })

        return NextResponse.json({ bookings })
    } catch (error) {
        console.error('Doctor bookings error:', error)
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }
}