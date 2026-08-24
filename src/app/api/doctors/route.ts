import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const specialisation = req.nextUrl.searchParams.get('specialisation')

        const doctors = await prisma.doctorProfile.findMany({
        where: specialisation
            ? { specialisation: { contains: specialisation, mode: 'insensitive' } }
            : undefined,
        include: {
            user: { select: { name: true } },
            slots: {
            where: { status: 'AVAILABLE', startTime: { gte: new Date() } },
            orderBy: { startTime: 'asc' },
            take: 20,
            },
        },
        })

        return NextResponse.json({ doctors })
    } catch (error) {
        console.error('Doctor search error:', error)
        return NextResponse.json({ error: 'Failed to search doctors' }, { status: 500 })
    }
}