import type { ToolCall, DetectedLanguage } from '@/types/assistant'
import { GEMINI_TOOL_DECLARATIONS } from './toolRegistry'

const GEMINI_STORAGE_KEY = 'spacefit_gemini_api_key'
const DEFAULT_MODEL = 'gemini-2.5-flash'

export interface GeminiResponse {
  success: boolean
  content: string
  toolCalls?: ToolCall[]
  errorType?: 'NO_API_KEY' | 'INVALID_KEY' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'UNKNOWN'
  errorMessage?: string
}

/**
 * Retrieves the configured Gemini API key from environment or local storage.
 */
export function getGeminiApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY
  if (typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim()
  }
  const stored = localStorage.getItem(GEMINI_STORAGE_KEY)
  if (stored && stored.trim().length > 0) {
    return stored.trim()
  }
  return ''
}

/**
 * Stores a user-provided Gemini API key in local storage.
 */
export function setGeminiApiKey(key: string): void {
  if (!key.trim()) {
    localStorage.removeItem(GEMINI_STORAGE_KEY)
  } else {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim())
  }
}

/**
 * Builds the system prompt for spatial multilingual architecture.
 */
function buildSystemPrompt(roomContextSummary: string, targetLanguage: DetectedLanguage): string {
  return `You are SpaceFit AI, an expert computational geometry specialist, architectural space planner, and multilingual 3D interior design assistant.

You have direct access to spatial tools to inspect room dimensions, manage furniture, run collision checks, and invoke an intelligent layout optimizer.

Current Active Room State:
${roomContextSummary}

Language Instructions:
- Support English, Tamil (தமிழ்), Thanglish (colloquial Tamil-English in Latin script, e.g., "En room-la walking space adhigama irukka arrange pannu"), and Hindi (हिन्दी).
- Target Language: ${targetLanguage}. Respond in this language unless the user asks for another.
- Preserve technical terms like dimensions, coordinates, SAT collision, and candidate names clearly.
- If the user asks to rearrange, optimize, add, remove, or rotate furniture, invoke the appropriate tool call.
- For consequential layout optimizations, provide a brief helpful rationale and call the optimize_layout tool.`
}

/**
 * Calls the Google Gemini Multilingual API with tool declarations.
 */
export async function callGeminiAssistant(
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  roomSummary: string,
  targetLanguage: DetectedLanguage
): Promise<GeminiResponse> {
  const apiKey = getGeminiApiKey()

  if (!apiKey) {
    return {
      success: false,
      content: '',
      errorType: 'NO_API_KEY',
      errorMessage:
        'Google Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file or enter your API key in the Assistant Settings.',
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`

  const systemInstruction = {
    parts: [{ text: buildSystemPrompt(roomSummary, targetLanguage) }],
  }

  const contents = [
    ...history,
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ]

  const tools = [
    {
      functionDeclarations: GEMINI_TOOL_DECLARATIONS,
    },
  ]

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction,
        contents,
        tools,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}))
      const status = response.status
      if (status === 401 || status === 403) {
        return {
          success: false,
          content: '',
          errorType: 'INVALID_KEY',
          errorMessage: 'Invalid Gemini API key. Please check your credentials.',
        }
      }
      if (status === 429) {
        return {
          success: false,
          content: '',
          errorType: 'RATE_LIMIT',
          errorMessage: 'Gemini API rate limit reached. Please wait a moment and retry.',
        }
      }
      return {
        success: false,
        content: '',
        errorType: 'UNKNOWN',
        errorMessage: errJson?.error?.message || `API error (${status})`,
      }
    }

    const data = await response.json()
    const candidate = data.candidates?.[0]
    const parts = candidate?.content?.parts || []

    let textContent = ''
    const toolCalls: ToolCall[] = []

    for (const part of parts) {
      if (part.text) {
        textContent += part.text
      }
      if (part.functionCall) {
        const fc = part.functionCall
        const toolId = `tool-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
        const requiresConfirmation =
          fc.name === 'optimize_layout' ||
          fc.name === 'apply_candidate_layout' ||
          fc.name === 'remove_furniture' ||
          fc.name === 'clear_all_furniture'

        toolCalls.push({
          id: toolId,
          tool: fc.name,
          parameters: fc.args || {},
          description: `Execute ${fc.name}`,
          requiresConfirmation,
          status: requiresConfirmation ? 'pending' : 'confirmed',
        })
      }
    }

    return {
      success: true,
      content: textContent.trim(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    }
  } catch (err: any) {
    return {
      success: false,
      content: '',
      errorType: 'NETWORK_ERROR',
      errorMessage: err?.message || 'Network connection failed while calling Gemini API.',
    }
  }
}
