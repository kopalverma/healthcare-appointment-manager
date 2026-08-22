import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json()

        const decodedToken = await adminAuth.verifyIdToken(idToken)

        const expiresIn = 60 * 60 * 24 * 5 * 1000
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

        const response = NextResponse.json({ success: true, role: decodedToken.role })

        response.cookies.set('session', sessionCookie, {
        maxAge: expiresIn / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        })

        return response
    } catch (error) {
        console.error('Session creation error:', error)
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
}