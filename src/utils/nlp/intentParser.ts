import type {
  IntentRecognitionResult,
  DetectedLanguage,
  ToolCall,
  SupportedLanguage,
} from '@/types/assistant'
import type { OptimizationMode } from '@/types/optimizer'
import { detectLanguage } from './languageDetector'

// Furniture keyword mappings to catalog items or categories
const FURNITURE_SYNONYMS: Record<string, string> = {
  // Beds
  bed: 'bed-queen',
  'queen bed': 'bed-queen',
  'single bed': 'bed-single',
  'king bed': 'bed-king',
  daybed: 'bed-single',
  kattil: 'bed-queen',
  katil: 'bed-queen',
  'கட்டில்': 'bed-queen',
  'படுக்கை': 'bed-queen',
  'बेड': 'bed-queen',
  'पलंग': 'bed-queen',

  // Desks & Tables
  desk: 'desk-workstation',
  table: 'desk-workstation',
  workstation: 'desk-workstation',
  'writing desk': 'desk-compact',
  'compact desk': 'desk-compact',
  'coffee table': 'table-coffee',
  nightstand: 'table-nightstand',
  'side table': 'table-nightstand',
  'dining table': 'dining-set-4',
  'மேஜை': 'desk-workstation',
  'டேபிள்': 'desk-workstation',
  'मेज़': 'desk-workstation',
  'टेबल': 'desk-workstation',

  // Chairs & Seating
  chair: 'chair-office',
  'office chair': 'chair-office',
  'task chair': 'chair-office',
  armchair: 'chair-armchair',
  sofa: 'sofa-3seat',
  couch: 'sofa-3seat',
  sectional: 'sofa-sectional',
  'l-shape sofa': 'sofa-sectional',
  'நாற்காலி': 'chair-office',
  'சோபா': 'sofa-3seat',
  'कुर्सी': 'chair-office',
  'सोफा': 'sofa-3seat',

  // Storage
  wardrobe: 'wardrobe-double',
  closet: 'wardrobe-double',
  almirah: 'wardrobe-double',
  bookshelf: 'bookshelf-5tier',
  shelf: 'bookshelf-5tier',
  credenza: 'credenza-media',
  'tv stand': 'credenza-media',
  'பீரோ': 'wardrobe-double',
  'अलमारी': 'wardrobe-double',

  // Decor
  lamp: 'lamp-floor-arc',
  plant: 'plant-ficus',
  'விளக்கு': 'lamp-floor-arc',
  'செடி': 'plant-ficus',
  'पौधा': 'plant-ficus',
}

/**
 * Extracts furniture catalog reference from user text
 */
function extractFurnitureEntity(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [synonym, catalogId] of Object.entries(FURNITURE_SYNONYMS)) {
    if (lower.includes(synonym)) {
      return catalogId
    }
  }
  return null
}

/**
 * Extracts optimization mode from text
 */
function extractOptimizationMode(text: string): OptimizationMode {
  const lower = text.toLowerCase()
  if (
    lower.includes('walk') ||
    lower.includes('movement') ||
    lower.includes('circulat') ||
    lower.includes('adhigama') ||
    lower.includes('walking space') ||
    lower.includes('वॉकिंग') ||
    lower.includes('चलने') ||
    lower.includes('रास्ता') ||
    lower.includes('जगह')
  ) {
    return 'movement-first'
  }
  if (
    lower.includes('save') ||
    lower.includes('space saver') ||
    lower.includes('compact') ||
    lower.includes('chinna') ||
    lower.includes('कम जगह') ||
    lower.includes('जगह बचा')
  ) {
    return 'space-saver'
  }
  if (
    lower.includes('study') ||
    lower.includes('productiv') ||
    lower.includes('window') ||
    lower.includes('light') ||
    lower.includes('padikara') ||
    lower.includes('पढ़ाई') ||
    lower.includes('खिड़की')
  ) {
    return 'study-productivity'
  }
  if (
    lower.includes('comfort') ||
    lower.includes('relax') ||
    lower.includes('cosy') ||
    lower.includes('nimmathi') ||
    lower.includes('आराम')
  ) {
    return 'comfort-focus'
  }
  return 'balanced'
}

/**
 * Extracts rotation degrees from text
 */
function extractDegrees(text: string): number {
  const match = text.match(/(-?\d+)\s*(deg|degree|°)?/i)
  if (match) {
    return parseInt(match[1], 10)
  }
  return 90
}

/**
 * Parses user input deterministically into structured IntentRecognitionResult
 */
export function parseIntentDeterministically(
  prompt: string,
  preferredLanguage: SupportedLanguage = 'auto'
): IntentRecognitionResult {
  const detection = detectLanguage(prompt)
  const language: DetectedLanguage =
    preferredLanguage !== 'auto'
      ? (preferredLanguage as DetectedLanguage)
      : detection.language

  const lower = prompt.toLowerCase().trim()

  // 1. Check for Undo
  if (
    lower.includes('undo') ||
    lower.includes('மீட்டமை') ||
    lower.includes('முந்தைய') ||
    lower.includes('undo pannu') ||
    lower.includes('undo karo') ||
    lower.includes('वापस') ||
    lower.includes('पूर्ववत')
  ) {
    return {
      intent: 'undo_last_action',
      confidence: 0.95,
      language,
      parameters: {},
    }
  }

  // 2. Check for Geometry / Collision Validation
  if (
    lower.includes('collision') ||
    lower.includes('overlap') ||
    lower.includes('clearance') ||
    lower.includes('validate') ||
    lower.includes('check') ||
    lower.includes('சரிபார்') ||
    lower.includes('மோதல்') ||
    lower.includes('இடைவெளி') ||
    lower.includes('paaru') ||
    lower.includes('टक्कर') ||
    lower.includes('जांच')
  ) {
    return {
      intent: 'validate_geometry',
      confidence: 0.92,
      language,
      parameters: {},
    }
  }

  // 3. Check for Room Information / Dimensions
  if (
    (lower.includes('room') && (lower.includes('dimension') || lower.includes('size') || lower.includes('area') || lower.includes('measurement'))) ||
    lower.includes('room size') ||
    lower.includes('அறை அளவு') ||
    lower.includes('அளவுகள்') ||
    lower.includes('room size enna') ||
    lower.includes('कमरे का आकार') ||
    lower.includes('कमरे का साइज')
  ) {
    return {
      intent: 'get_room_info',
      confidence: 0.9,
      language,
      parameters: {},
    }
  }

  // 4. Check for List Furniture
  if (
    (lower.includes('list') && (lower.includes('furniture') || lower.includes('items'))) ||
    lower.includes('what is placed') ||
    lower.includes('items in room') ||
    lower.includes('பொருட்கள் என்ன') ||
    lower.includes('என்னென்ன இருக்கு') ||
    lower.includes('सामान की सूची')
  ) {
    return {
      intent: 'list_furniture',
      confidence: 0.9,
      language,
      parameters: {},
    }
  }

  // 5. Check for Optimization Intent (e.g. "En room-la walking space adhigama irukka bed and table-ai arrange pannu")
  if (
    lower.includes('arrange') ||
    lower.includes('optimize') ||
    lower.includes('layout') ||
    lower.includes('walking space') ||
    lower.includes('organize') ||
    lower.includes('ஒழுங்குபடுத்து') ||
    lower.includes('அமை') ||
    lower.includes('pannu') ||
    lower.includes('अरेंज') ||
    lower.includes('व्यवस्थित') ||
    lower.includes('सजाओ')
  ) {
    const mode = extractOptimizationMode(prompt)
    const deskNearWindow = lower.includes('window') || lower.includes('light') || lower.includes('காற்றோட்டம்') || lower.includes('வெளிச்சம்') || lower.includes('खिड़की')
    return {
      intent: 'optimize_layout',
      confidence: 0.92,
      language,
      parameters: {
        mode,
        deskNearWindow,
      },
    }
  }

  // 6. Check for Add Furniture Intent
  if (
    lower.includes('add') ||
    lower.includes('insert') ||
    lower.includes('place') ||
    lower.includes('put') ||
    lower.includes('சேர்') ||
    lower.includes('வை') ||
    lower.includes('podu') ||
    lower.includes('vei') ||
    lower.includes('veinga') ||
    lower.includes('जोड़ो') ||
    lower.includes('लगाओ') ||
    lower.includes('डालो') ||
    lower.includes('रखो')
  ) {
    const entity = extractFurnitureEntity(prompt)
    if (entity) {
      return {
        intent: 'add_furniture',
        confidence: 0.92,
        language,
        parameters: { catalogId: entity },
      }
    }
    // Furniture item not recognized
    const clarifyingQuestion =
      language === 'ta'
        ? 'எந்த பொருளை நீங்கள் சேர்க்க விரும்புகிறீர்கள்? (உதாரணம்: கட்டில், மேஜை, நாற்காலி, சோபா, பீரோ)'
        : language === 'thanglish'
        ? 'Enna furniture add pannanum? (e.g., bed, desk, chair, sofa, wardrobe)'
        : language === 'hi'
        ? 'आप कौन सा फर्नीचर जोड़ना चाहते हैं? (जैसे: बेड, मेज, कुर्सी, सोफा, अलमारी)'
        : 'Which furniture item would you like to add? (e.g., queen bed, study desk, task chair, 3-seater sofa, double wardrobe)'

    return {
      intent: 'clarification_needed',
      confidence: 0.6,
      language,
      parameters: {},
      clarifyingQuestion,
    }
  }

  // 7. Check for Rotate Furniture
  if (
    lower.includes('rotate') ||
    lower.includes('turn') ||
    lower.includes('சுழற்று') ||
    lower.includes('திருப்பு') ||
    lower.includes('rotate pannu') ||
    lower.includes('घुमाओ') ||
    lower.includes('मोड़ो')
  ) {
    const entity = extractFurnitureEntity(prompt)
    const degrees = extractDegrees(prompt)
    return {
      intent: 'rotate_furniture',
      confidence: 0.88,
      language,
      parameters: {
        furnitureId: entity || 'selected',
        degrees,
      },
    }
  }

  // 8. Check for Remove / Delete Furniture
  if (
    lower.includes('remove') ||
    lower.includes('delete') ||
    lower.includes('clear') ||
    lower.includes('நீக்கு') ||
    lower.includes('அகற்று') ||
    lower.includes('edunga') ||
    lower.includes('hatao') ||
    lower.includes('हटाओ')
  ) {
    const entity = extractFurnitureEntity(prompt)
    if (lower.includes('all') || lower.includes('everything') || lower.includes('முழுவதும்') || lower.includes('सब')) {
      return {
        intent: 'clear_all_furniture',
        confidence: 0.95,
        language,
        parameters: {},
      }
    }
    return {
      intent: 'remove_furniture',
      confidence: 0.88,
      language,
      parameters: {
        furnitureId: entity || 'selected',
      },
    }
  }

  // 9. Ambiguous or General Query
  const genericClarification =
    language === 'ta'
      ? 'மன்னிக்கவும், உங்கள் கோரிக்கையை புரிந்து கொள்ள முடியவில்லை. நீங்கள் அறையை ஒழுங்குபடுத்தலாம், புதிய பொருட்களை சேர்க்கலாம் அல்லது மோதல்களை சரிபார்க்கலாம்.'
      : language === 'thanglish'
      ? 'Puriyala. Room layout-ai optimize panna, pudhu furniture add panna, illa collisions check panna sollunga!'
      : language === 'hi'
      ? 'माफ़ कीजिए, आपका निर्देश स्पष्ट नहीं था। क्या आप लेआउट ऑप्टिमाइज़ करना चाहते हैं, नया फर्नीचर जोड़ना चाहते हैं, या टक्कर की जांच करना चाहते हैं?'
      : 'I could not recognize that action. You can optimize the layout, add or rotate furniture, or check geometric collisions. How can I help?'

  return {
    intent: 'clarification_needed',
    confidence: 0.4,
    language,
    parameters: {},
    clarifyingQuestion: genericClarification,
  }
}

/**
 * Constructs a structured allowlisted ToolCall from an IntentRecognitionResult
 */
export function buildToolCallFromIntent(intentResult: IntentRecognitionResult): ToolCall | null {
  if (intentResult.intent === 'general_chat' || intentResult.intent === 'clarification_needed') {
    return null
  }

  const id = `tool-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
  const tool = intentResult.intent

  // Actions requiring explicit user confirmation before applying
  const requiresConfirmation =
    tool === 'optimize_layout' ||
    tool === 'apply_candidate_layout' ||
    tool === 'remove_furniture' ||
    tool === 'clear_all_furniture'

  let description = `Execute ${tool}`
  if (tool === 'optimize_layout') {
    const mode = (intentResult.parameters.mode as string) || 'movement-first'
    description = `Optimize room arrangement using ${mode.replace(/-/g, ' ')} strategy.`
  } else if (tool === 'add_furniture') {
    description = `Add ${String(intentResult.parameters.catalogId || 'furniture')} to the room.`
  } else if (tool === 'remove_furniture') {
    description = `Remove item from the room.`
  } else if (tool === 'rotate_furniture') {
    description = `Rotate item by ${Number(intentResult.parameters.degrees || 90)}°.`
  } else if (tool === 'validate_geometry') {
    description = 'Validate furniture collisions and clearances using SAT engine.'
  } else if (tool === 'get_room_info') {
    description = 'Retrieve room geometry telemetry.'
  }

  return {
    id,
    tool,
    parameters: intentResult.parameters,
    description,
    requiresConfirmation,
    status: requiresConfirmation ? 'pending' : 'confirmed',
  }
}
