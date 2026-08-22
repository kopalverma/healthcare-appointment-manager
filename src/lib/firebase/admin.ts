import { initializeApp , getApps , cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g , '\n')

const adminApp = getApps().length
? getApps()[0]
: initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
    }),
})

export const adminAuth = getAuth(adminApp)