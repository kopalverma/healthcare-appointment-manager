import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ doctorId: string }> }
    ) {
    try {
        const { doctorId } = await params
        const { startDate, endDate } = await req.json() 

        const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } })
        if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })

        const leaveDays = await prisma.leaveDay.findMany({
        where: { doctorId: doctorId, date: { gte: new Date(startDate), lte: new Date(endDate) } },
        })
        const leaveDateStrings = new Set(leaveDays.map((l) => l.date.toISOString().split('T')[0]))

        const [startHour, startMin] = doctor.workStartTime.split(':').map(Number)
        const [endHour, endMin] = doctor.workEndTime.split(':').map(Number)

        const slotsToCreate: { doctorId: string; startTime: Date; endTime: Date }[] = []
        const current = new Date(startDate)
        const end = new Date(endDate)

        while (current <= end) {
        const dateString = current.toISOString().split('T')[0]

        if (!leaveDateStrings.has(dateString)) {
            let slotStart = new Date(current)
            slotStart.setHours(startHour, startMin, 0, 0)

            const dayEnd = new Date(current)
            dayEnd.setHours(endHour, endMin, 0, 0)

            while (slotStart < dayEnd) {
            const slotEnd = new Date(slotStart.getTime() + doctor.slotDurationMin * 60000)
            if (slotEnd > dayEnd) break

            slotsToCreate.push({ doctorId: doctor.id, startTime: new Date(slotStart), endTime: slotEnd })
            slotStart = slotEnd
            }
        }

        current.setDate(current.getDate() + 1)
        }

        // skipDuplicates relies on the @@unique([doctorId, startTime]) constraint from your schema
        const result = await prisma.slot.createMany({ data: slotsToCreate, skipDuplicates: true })

        return NextResponse.json({ success: true, slotsCreated: result.count })
    } catch (error) {
        console.error('Generate slots error:', error)
        return NextResponse.json({ error: 'Failed to generate slots' }, { status: 500 })
    }
}