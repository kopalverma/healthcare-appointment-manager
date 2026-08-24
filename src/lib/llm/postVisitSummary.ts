import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export async function generatePostVisitSummary(notes: string, prescription: string) {
    try {
        const { text } = await generateText({
        model: google('gemini-3.6-flash'),
        prompt: `Convert these clinical notes into a patient-friendly summary with a clear medication schedule and follow-up steps. Keep it simple, no jargon. Notes: ${notes}. Prescription: ${prescription}`,
        })
        return { success: true, data: text }
    } catch (error) {
        console.error('Post-visit LLM error:', error)
        return { success: false, data: null }
    }
}