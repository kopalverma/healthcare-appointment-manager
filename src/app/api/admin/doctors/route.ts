import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const doctors = await prisma.doctorProfile.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json({ doctors })
    } catch (error) {
        console.error('Fetch doctors error:', error)
        return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
    }
}