import { NextRequest , NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { prisma } from '@/lib/prisma'


export async function POST(req :NextRequest) {
    try{
        const { email , password , name , role} = await req.json()

        if(!email || !password || !name || !role){
            return NextResponse.json({error: 'Missing required fields'} , {status : 400})
        }

        if(!['PATIENT' , 'DOCTOR' , 'ADMIN'].includes(role)){
            return NextResponse.json({error: 'Invalid role'} , {status : 400})
        }

        const firebaseUser = await adminAuth.createUser({email , password , displayName: name})

        await adminAuth.setCustomUserClaims(firebaseUser.uid , {role})

        const user = await prisma.user.create({
            data: {
                id: firebaseUser.uid,
                email,
                name,
                role,
                ...(role === 'DOCTOR' &&{
                    doctorProfile: {
                        create: {specialisation: '', workStartTime: '09:00' , workEndTime: '17:00'},
                    },
                }),
                ...(role === 'PATIENT' &&{
                    patientProfile: {create: {}},
                }),
            },
        })

        return NextResponse.json({success: true, userId: user.id})
    } catch(error: any){
        console.error('Signup error:', error)
        return NextResponse.json({ error: error.message || 'Signup failed'} , { status : 500})
    }
}