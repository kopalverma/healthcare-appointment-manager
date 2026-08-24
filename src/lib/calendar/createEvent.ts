import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
})

export async function createCalendarEvent(booking: {
    id: string
    startTime: Date
    endTime: Date
    patientEmail: string
    doctorEmail: string
    patientName: string
    doctorName: string
}) {
    try {
        const event = await calendar.events.insert({
            calendarId: 'primary',
            sendUpdates: 'all',
            requestBody: {
                summary: `Medical Appointment - Dr. ${booking.doctorName}`,
                description:
                    `Healthcare appointment\n\nPatient: ${booking.patientName}\nDoctor: Dr. ${booking.doctorName}\nBooking ID: ${booking.id}`,
                start: {
                    dateTime: booking.startTime.toISOString(),
                },
                end: {
                    dateTime: booking.endTime.toISOString(),
                },
                attendees: [
                    { email: booking.patientEmail },
                    { email: booking.doctorEmail },
                ],
                reminders: {
                    useDefault: true,
                },
            },
        })

        return {
            success: true,
            eventId: event.data.id ?? null,
        }
    } catch (error) {
        console.error('Calendar create error:', error)

        return {
            success: false,
            eventId: null,
        }
    }
}

export async function updateCalendarEvent(
    eventId: string,
    booking: {
        id: string
        startTime: Date
        endTime: Date
        patientEmail: string
        doctorEmail: string
        patientName: string
        doctorName: string
    }
) {
    try {
        await calendar.events.update({
            calendarId: 'primary',
            eventId,
            sendUpdates: 'all',
            requestBody: {
                summary: `Medical Appointment - Dr. ${booking.doctorName}`,
                description:
                    `Healthcare appointment\n\nPatient: ${booking.patientName}\nDoctor: Dr. ${booking.doctorName}\nBooking ID: ${booking.id}`,
                start: {
                    dateTime: booking.startTime.toISOString(),
                },
                end: {
                    dateTime: booking.endTime.toISOString(),
                },
                attendees: [
                    { email: booking.patientEmail },
                    { email: booking.doctorEmail },
                ],
            },
        })

        return { success: true }
    } catch (error) {
        console.error('Calendar update error:', error)
        return { success: false }
    }
}

export async function deleteCalendarEvent(eventId: string) {
    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId,
            sendUpdates: 'all',
        })

        return { success: true }
    } catch (error) {
        console.error('Calendar delete error:', error)
        return { success: false }
    }
}