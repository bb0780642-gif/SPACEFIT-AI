import type { DetectedLanguage } from '@/types/assistant'
import type { CandidateLayout } from '@/types/optimizer'

export function generateOptimizationResponse(
  candidates: CandidateLayout[],
  mode: string,
  language: DetectedLanguage
): string {
  const top = candidates[0]
  if (!top) return 'No feasible layout candidate generated.'

  if (language === 'ta') {
    return `அறைக்கான தளவமைப்பு உகந்ததாக்கப்பட்டது! (${mode.replace(/-/g, ' ')})
• சிறந்த மதிப்பெண்: ${top.score.overallScore}/100
• பயன்படுத்தக்கூடிய தரைப்பரப்பு: ${top.score.usableAreaMeters.toFixed(1)} m² (${top.score.usableAreaPercent.toFixed(0)}%)
• நடைபாதை இடைவெளி: ${top.score.circulationScore}/100

கீழே உள்ள முன்னோட்டம் (Preview 3D) பொத்தானை அழுத்தி 3D-ல் பார்த்து, திருப்தியாக இருந்தால் பயன்பாட்டை (Apply Layout) உறுதிசெய்யவும்.`
  }

  if (language === 'thanglish') {
    return `Unga room layout-ai ${mode.replace(/-/g, ' ')} strategy-la optimize panniyachu!
• Top layout score: ${top.score.overallScore}/100
• Usable floor space: ${top.score.usableAreaMeters.toFixed(1)} m² (${top.score.usableAreaPercent.toFixed(0)}%)
• Walking clearance score: ${top.score.circulationScore}/100

Keela irukura "Preview in 3D" click panni paathutu, "Apply Layout" confirm pannunga!`
  }

  if (language === 'hi') {
    return `कमरे का लेआउट ${mode.replace(/-/g, ' ')} रणनीति के अनुसार ऑप्टिमाइज़ कर दिया गया है!
• टॉप स्कोर: ${top.score.overallScore}/100
• उपयोग योग्य फर्श क्षेत्र: ${top.score.usableAreaMeters.toFixed(1)} m² (${top.score.usableAreaPercent.toFixed(0)}%)
• वॉकवे क्लीयरेंस स्कोर: ${top.score.circulationScore}/100

नीचे दिए गए "Preview in 3D" पर क्लिक करके 3D सीन में देखें और लेआउट लागू करने के लिए "Apply Layout" दबाएं।`
  }

  return `Optimized room layout generated using the ${mode.replace(/-/g, ' ')} strategy!
• Top candidate score: ${top.score.overallScore}/100
• Usable floor area: ${top.score.usableAreaMeters.toFixed(1)} m² (${top.score.usableAreaPercent.toFixed(0)}%)
• Circulation pathway score: ${top.score.circulationScore}/100

Click "Preview in 3D" below to review coordinates live, or "Apply Layout" to confirm.`
}

export function generateAddFurnitureResponse(
  itemName: string,
  language: DetectedLanguage
): string {
  if (language === 'ta') {
    return `"${itemName}" அறைக்குள் வெற்றிகரமாக சேர்க்கப்பட்டது. தேவைப்பட்டால் அதை நகர்த்தலாம் அல்லது சுழற்றலாம்.`
  }
  if (language === 'thanglish') {
    return `"${itemName}"-ai room-la add panniyachu! Theva patta adha move panno rotate panno pannikalam.`
  }
  if (language === 'hi') {
    return `"${itemName}" को कमरे में जोड़ दिया गया है। आप इसे 3D सीन में मूव या रोटेट कर सकते हैं।`
  }
  return `Added "${itemName}" to the room. You can reposition or rotate it in the 3D twin.`
}

export function generateValidationResponse(
  isValid: boolean,
  errorCount: number,
  warningCount: number,
  language: DetectedLanguage
): string {
  if (isValid && warningCount === 0) {
    if (language === 'ta') {
      return 'அறை வடிவியல் முற்றிலும் சரியானது! எந்த மோதல்களோ அல்லது கதவு அடைப்புகளோ இல்லை.'
    }
    if (language === 'thanglish') {
      return 'Geometry checking perfect! Endha collision-um illa, doors ellam clear-ah irukku.'
    }
    if (language === 'hi') {
      return 'कमरे का लेआउट एकदम सही है! कोई टक्कर या दरवाज़ा अवरोध नहीं है।'
    }
    return 'Room geometry is perfectly clear: zero furniture collisions, full wall containment, and clear door entrance buffers.'
  }

  if (language === 'ta') {
    return `வடிவியல் எச்சரிக்கை: ${errorCount} மோதல்கள் மற்றும் ${warningCount} அனுமதி எச்சரிக்கைகள் உள்ளன.`
  }
  if (language === 'thanglish') {
    return `Spatial issues alert: ${errorCount} collisions matrum ${warningCount} clearance warnings irukku. Detail paaka "Explain Warnings" sollunga.`
  }
  if (language === 'hi') {
    return `सावधानी: कमरे में ${errorCount} टक्कर और ${warningCount} क्लीयरेंस चेतावनियां पाई गई हैं।`
  }
  return `Spatial check found ${errorCount} collision error(s) and ${warningCount} clearance warning(s).`
}
