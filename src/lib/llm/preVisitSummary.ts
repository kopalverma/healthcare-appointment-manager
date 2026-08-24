import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const summarySchema = z.object({
    urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    chiefComplaint: z.string(),
    suggestedQuestions: z.array(z.string()).length(3),
    })

    export async function generatePreVisitSummary(symptoms: string) {
    try {
        const { object } = await generateObject({
        model: google('gemini-3.6-flash'),
        schema: summarySchema,
        prompt: `Analyse these patient symptoms and return: urgency level (Low/Medium/High), chief complaint, and three suggested questions for the doctor. If symptoms mention chest pain, severe shortness of breath, uncontrolled bleeding, or signs of stroke, always mark urgency as HIGH. Symptoms: ${symptoms}`,
        })
        return { success: true, data: object }
    } catch (error) {
        console.error('LLM summary error:', error)
        return { success: false, data: null }
    }
}