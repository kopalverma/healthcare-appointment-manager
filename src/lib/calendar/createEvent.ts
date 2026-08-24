import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
)
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

export async function createCalendarEvent(booking: {
    id: string
    startTime: Date
    endTime: Date
    patientEmail: string
    doctorEmail: string
    summary: string
}) {
    try {
        const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: booking.summary,
            start: { dateTime: booking.startTime.toISOString() },
            end: { dateTime: booking.endTime.toISOString() },
            attendees: [{ email: booking.patientEmail }, { email: booking.doctorEmail }],
        },
        })
        return { success: true, eventId: event.data.id }
    } catch (error) {
        console.error('Calendar create error:', error)
        return { success: false, eventId: null }
    }
}