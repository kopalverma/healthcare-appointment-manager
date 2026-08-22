import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { doctorId: string } }) {
    try {
        const { specialisation, workStartTime, workEndTime, slotDurationMin } = await req.json()

        const updated = await prisma.doctorProfile.update({
        where: { id: params.doctorId },
        data: { specialisation, workStartTime, workEndTime, slotDurationMin },
        })

        return NextResponse.json({ success: true, doctor: updated })
    } catch (error) {
        console.error('Update doctor error:', error)
        return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 })
    }
}