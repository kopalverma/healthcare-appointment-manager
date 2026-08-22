import { NextRequest, NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'

const roleRoutes: Record<string, string> = {
    '/patient': 'PATIENT',
    '/doctor': 'DOCTOR',
    '/admin': 'ADMIN',
    }

    export function middleware(req: NextRequest) {
    const session = req.cookies.get('session')?.value
    const path = req.nextUrl.pathname

    const matchedPrefix = Object.keys(roleRoutes).find((prefix) => path.startsWith(prefix))
    if (!matchedPrefix) return NextResponse.next()

    if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    try {
        const decoded: any = jwtDecode(session)
        const requiredRole = roleRoutes[matchedPrefix]

        if (decoded.role !== requiredRole) {
        return NextResponse.redirect(new URL('/login', req.url))
        }
    } catch {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
    }

    export const config = {
    matcher: ['/patient/:path*', '/doctor/:path*', '/admin/:path*'],
}