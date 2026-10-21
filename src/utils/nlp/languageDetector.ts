import type { DetectedLanguage } from '@/types/assistant'

// Tamil unicode character range
const TAMIL_SCRIPT_REGEX = /[\u0B80-\u0BFF]/

// Devanagari (Hindi) unicode character range
const DEVANAGARI_SCRIPT_REGEX = /[\u0900-\u097F]/

// Distinctive Thanglish words, suffixes, and conversational markers
const THANGLISH_KEYWORDS = [
  'en', 'room-la', 'roomla', 'room la', 'vei', 'veinga', 'podu', 'podunga',
  'pannu', 'pannunga', 'adhigama', 'adhigam', 'irukka', 'irukku', 'edunga',
  'maathu', 'maathunga', 'paaru', 'paarunga', 'chinna', 'periya', 'nadula',
  'oram', 'orathula', 'sari', 'theva', 'idhu', 'adhu', 'epdi', 'enna', 'nalla',
  'kattil', 'bed-ai', 'table-ai', 'sofa-vai', 'clearance-ai', 'space-ai'
]

// Distinctive Hinglish words (Latin script Hindi)
const HINGLISH_KEYWORDS = [
  'kamra', 'kamre', 'kamre me', 'karo', 'kariye', 'hatao', 'hataiye',
  'rakho', 'rakhiye', 'lagaao', 'lagao', 'badhao', 'jagah', 'badao',
  'dekh', 'dekho', 'kya', 'hai', 'chahiye', 'thoda', 'saaf'
]

function matchesWordOrPhrase(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i')
  return regex.test(text)
}

export interface LanguageDetectionResult {
  language: DetectedLanguage
  confidence: number
  script: 'tamil' | 'devanagari' | 'latin' | 'mixed'
}

/**
 * Detects the language of a user prompt (Tamil script, Devanagari Hindi, Thanglish, or English).
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  const trimmed = text.trim()
  if (!trimmed) {
    return { language: 'en', confidence: 1.0, script: 'latin' }
  }

  // 1. Check for Tamil script
  const tamilMatches = trimmed.match(new RegExp(TAMIL_SCRIPT_REGEX, 'g'))
  if (tamilMatches && tamilMatches.length > 2) {
    const ratio = tamilMatches.length / trimmed.length
    return {
      language: 'ta',
      confidence: Math.min(1.0, 0.7 + ratio),
      script: 'tamil'
    }
  }

  // 2. Check for Devanagari script (Hindi)
  const devanagariMatches = trimmed.match(new RegExp(DEVANAGARI_SCRIPT_REGEX, 'g'))
  if (devanagariMatches && devanagariMatches.length > 2) {
    const ratio = devanagariMatches.length / trimmed.length
    return {
      language: 'hi',
      confidence: Math.min(1.0, 0.7 + ratio),
      script: 'devanagari'
    }
  }

  // 3. Check for Thanglish (Latin script Tamil-English colloquial)
  let thanglishScore = 0
  for (const kw of THANGLISH_KEYWORDS) {
    if (matchesWordOrPhrase(trimmed, kw)) {
      thanglishScore += 1
    }
  }

  // 4. Check for Hinglish (Latin script Hindi)
  let hinglishScore = 0
  for (const kw of HINGLISH_KEYWORDS) {
    if (matchesWordOrPhrase(trimmed, kw)) {
      hinglishScore += 1
    }
  }

  if (thanglishScore > 0 && thanglishScore >= hinglishScore) {
    return {
      language: 'thanglish',
      confidence: Math.min(0.95, 0.6 + thanglishScore * 0.15),
      script: 'latin'
    }
  }

  if (hinglishScore > 0) {
    return {
      language: 'hi',
      confidence: Math.min(0.95, 0.6 + hinglishScore * 0.15),
      script: 'latin'
    }
  }

  // Default to English
  return {
    language: 'en',
    confidence: 0.85,
    script: 'latin'
  }
}
