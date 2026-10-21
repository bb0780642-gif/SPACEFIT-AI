import { describe, it, expect } from 'vitest'
import { detectLanguage } from './languageDetector'

describe('NLP Language Detector', () => {
  it('detects pure Tamil script correctly', () => {
    const text = 'என் அறையில் உள்ள மேஜை மற்றும் கட்டிலை ஒழுங்குபடுத்து'
    const result = detectLanguage(text)
    expect(result.language).toBe('ta')
    expect(result.script).toBe('tamil')
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  it('detects Devanagari Hindi script correctly', () => {
    const text = 'कमरे में वॉकिंग स्पेस बढ़ाने के लिए फर्नीचर अरेंज करो'
    const result = detectLanguage(text)
    expect(result.language).toBe('hi')
    expect(result.script).toBe('devanagari')
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  it('detects colloquial Tamil-English (Thanglish) in Latin characters', () => {
    const text = 'En room-la walking space adhigama irukka bed and table-ai arrange pannu'
    const result = detectLanguage(text)
    expect(result.language).toBe('thanglish')
    expect(result.script).toBe('latin')
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  it('detects another common Thanglish expression', () => {
    const text = 'Oru queen bed podu, desk-ai window pakkathula vei'
    const result = detectLanguage(text)
    expect(result.language).toBe('thanglish')
  })

  it('detects Latin Hinglish', () => {
    const text = 'kamre me bed lagao aur walking jagah badhao'
    const result = detectLanguage(text)
    expect(result.language).toBe('hi')
  })

  it('defaults clean English to en', () => {
    const text = 'Optimize the furniture arrangement for maximum open walking space'
    const result = detectLanguage(text)
    expect(result.language).toBe('en')
    expect(result.script).toBe('latin')
  })
})
