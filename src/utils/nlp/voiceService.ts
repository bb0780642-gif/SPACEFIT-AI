import type { SupportedLanguage, DetectedLanguage } from '@/types/assistant'

// Web Speech API interface declarations for TypeScript
interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  const win = window as IWindowWithSpeech
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition)
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * Returns BCP-47 language tag for speech recognition and synthesis
 */
export function getLanguageCodeForVoice(lang: SupportedLanguage | DetectedLanguage): string {
  switch (lang) {
    case 'ta':
    case 'thanglish':
      return 'ta-IN'
    case 'hi':
      return 'hi-IN'
    case 'en':
    default:
      return 'en-US'
  }
}

/**
 * Creates a SpeechRecognition instance with proper language and callbacks
 */
export function createSpeechRecognizer(
  lang: SupportedLanguage | DetectedLanguage,
  onResult: (text: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): any | null {
  if (!isSpeechRecognitionSupported()) return null

  const win = window as IWindowWithSpeech
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition
  const recognizer = new SpeechRecognitionClass()

  recognizer.continuous = false
  recognizer.interimResults = false
  recognizer.lang = getLanguageCodeForVoice(lang)

  recognizer.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0]?.[0]?.transcript
    if (transcript) {
      onResult(transcript)
    }
  }

  recognizer.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError(event.error || 'Speech recognition error')
  }

  recognizer.onend = () => {
    onEnd()
  }

  return recognizer
}

/**
 * Speaks text using the browser's SpeechSynthesis API
 */
export function speakText(text: string, lang: SupportedLanguage | DetectedLanguage): void {
  if (!isSpeechSynthesisSupported()) return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  // Clean markdown asterisks and bullets for cleaner speech
  const clean = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/[•\n]/g, ' ')
    .trim()

  if (!clean) return

  const utterance = new SpeechSynthesisUtterance(clean)
  utterance.lang = getLanguageCodeForVoice(lang)
  utterance.rate = 1.0
  utterance.pitch = 1.0

  window.speechSynthesis.speak(utterance)
}

/**
 * Stops any ongoing SpeechSynthesis
 */
export function stopSpeech(): void {
  if (!isSpeechSynthesisSupported()) return
  window.speechSynthesis.cancel()
}
