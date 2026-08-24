import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slotId: string }> }
    ) {
    try {
        const { slotId } = await params

        // 1. Verify the logged-in patient from the session cookie
        const sessionCookie = req.cookies.get('session')?.value
        if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const decoded = await adminAuth.verifySessionCookie(sessionCookie)
        if (decoded.role !== 'PATIENT') {
        return NextResponse.json({ error: 'Only patients can hold slots' }, { status: 403 })
        }

        const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: decoded.uid } })
        if (!patientProfile) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })

        // 2. Run the actual hold creation as one atomic transaction
        const hold = await prisma.$transaction(async (tx) => {
        const slot = await tx.slot.findUnique({ where: { id: slotId } })

        if (!slot) throw new Error('SLOT_NOT_FOUND')
        if (slot.status !== 'AVAILABLE') throw new Error('SLOT_UNAVAILABLE')

        const newHold = await tx.slotHold.create({
            data: {
            slotId,
            patientId: patientProfile.id,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
            },
        })

        await tx.slot.update({ where: { id: slotId }, data: { status: 'HELD' } })

        return newHold
        })

        return NextResponse.json({ success: true, hold })
    } catch (error: any) {
        console.error('Slot hold error:', error)

        if (error.message === 'SLOT_NOT_FOUND') {
        return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
        }
        if (error.message === 'SLOT_UNAVAILABLE') {
        return NextResponse.json({ error: 'This slot is no longer available' }, { status: 409 })
        }
        // Postgres unique constraint violation — the real race-condition guard
        if (error.code === 'P2002') {
        return NextResponse.json({ error: 'This slot was just taken by someone else' }, { status: 409 })
        }

        return NextResponse.json({ error: 'Failed to hold slot' }, { status: 500 })
    }
}