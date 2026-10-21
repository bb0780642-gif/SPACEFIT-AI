import { describe, it, expect } from 'vitest'
import { parseIntentDeterministically, buildToolCallFromIntent } from './intentParser'

describe('NLP Deterministic Intent Parser', () => {
  it('parses Thanglish optimization prompt correctly', () => {
    const prompt = 'En room-la walking space adhigama irukka bed and table-ai arrange pannu.'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('optimize_layout')
    expect(result.language).toBe('thanglish')
    expect(result.parameters.mode).toBe('movement-first')

    const toolCall = buildToolCallFromIntent(result)
    expect(toolCall).not.toBeNull()
    expect(toolCall?.tool).toBe('optimize_layout')
    expect(toolCall?.requiresConfirmation).toBe(true)
  })

  it('parses Hindi optimization request correctly', () => {
    const prompt = 'कमरे में वॉकिंग स्पेस बढ़ाने के लिए फर्नीचर अरेंज करो'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('optimize_layout')
    expect(result.language).toBe('hi')
    expect(result.parameters.mode).toBe('movement-first')
  })

  it('parses English add bed request correctly', () => {
    const prompt = 'Please add a queen platform bed to the room'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('add_furniture')
    expect(result.parameters.catalogId).toBe('bed-queen')
  })

  it('parses Tamil add furniture request correctly', () => {
    const prompt = 'அறைக்குள் ஒரு கட்டில் சேர்'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('add_furniture')
    expect(result.parameters.catalogId).toBe('bed-queen')
  })

  it('parses collision verification request correctly', () => {
    const prompt = 'Check for furniture collisions and entrance clearance'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('validate_geometry')
  })

  it('parses room dimension telemetry request correctly', () => {
    const prompt = 'What are the room dimensions and floor area?'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('get_room_info')
  })

  it('parses undo command correctly', () => {
    const prompt = 'Undo the last change'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('undo_last_action')
  })

  it('returns clarification_needed for ambiguous requests', () => {
    const prompt = 'Hello, can you do something?'
    const result = parseIntentDeterministically(prompt)

    expect(result.intent).toBe('clarification_needed')
    expect(result.clarifyingQuestion).toBeDefined()
  })
})
