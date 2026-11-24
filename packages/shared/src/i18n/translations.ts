export interface LocalizedDictionary {
  step: string;
  of: string;
  back: string;
  next: string;
  readAloud: string;
  speak: string;
  listening: string;
  stopListening: string;
  showOriginal: string;
  useOriginalPage: string;
  reviewTitle: string;
  edit: string;
  submitConfirm: string;
  cancel: string;
  confirmPrompt: string;
  successSubmitted: string;
  largestDebit: string;
  largestCredit: string;
  allRecords: string;
  tableTitle: string;
  searchPlaceholder: string;
  voiceEchoConfirm: string;
  yesCorrect: string;
  tryAgain: string;
}

export const I18N_STRINGS: Record<string, LocalizedDictionary> = {
  en: {
    step: "Step",
    of: "of",
    back: "Back",
    next: "Next",
    readAloud: "Read aloud",
    speak: "Speak answer",
    listening: "Listening... speak now",
    stopListening: "Stop listening",
    showOriginal: "Show original",
    useOriginalPage: "Use original page",
    reviewTitle: "Please review your answers",
    edit: "Change",
    submitConfirm: "Confirm & Submit",
    cancel: "Go back",
    confirmPrompt: "You are about to submit your application on the official portal.",
    successSubmitted: "Your details have been submitted and verified on the portal.",
    largestDebit: "Largest debit",
    largestCredit: "Largest credit",
    allRecords: "All entries",
    tableTitle: "Statement & Transactions",
    searchPlaceholder: "Search entries...",
    voiceEchoConfirm: "I heard: {value}. Is this correct?",
    yesCorrect: "Yes, continue",
    tryAgain: "Try again",
  },
  hi: {
    step: "चरण",
    of: "का",
    back: "पीछे जाएं",
    next: "आगे बढ़ें",
    readAloud: "बोलकर सुनाएं",
    speak: "बोलकर उत्तर दें",
    listening: "सुन रहे हैं... कृपया बोलें",
    stopListening: "रोकें",
    showOriginal: "मूल पृष्ठ देखें",
    useOriginalPage: "मूल पृष्ठ का उपयोग करें",
    reviewTitle: "कृपया अपने विवरण की समीक्षा करें",
    edit: "बदलें",
    submitConfirm: "पुष्टि करें और जमा करें",
    cancel: "वापस जाएं",
    confirmPrompt: "आप आधिकारिक पोर्टल पर अपना आवेदन जमा करने जा रहे हैं।",
    successSubmitted: "आपके विवरण पोर्टल पर सफलतापूर्वक जमा हो गए हैं।",
    largestDebit: "सबसे बड़ा खर्च",
    largestCredit: "सबसे बड़ा जमा",
    allRecords: "सभी प्रविष्टियां",
    tableTitle: "खाता विवरण एवं लेन-देन",
    searchPlaceholder: "खोजें...",
    voiceEchoConfirm: "मैंने सुना: {value}। क्या यह सही है?",
    yesCorrect: "हाँ, आगे बढ़ें",
    tryAgain: "फिर से बोलें",
  },
  ta: {
    step: "படி",
    of: "/",
    back: "பின்னே",
    next: "அடுத்து",
    readAloud: "வாசிக்கவும்",
    speak: "குரல் மூலம் பதிலளிக்கவும்",
    listening: "கேட்கிறது...",
    stopListening: "நிறுத்து",
    showOriginal: "அசல் பக்கம்",
    useOriginalPage: "அசல் பக்கத்திற்கு செல்",
    reviewTitle: "உங்கள் தகவல்களைச் சரிபார்க்கவும்",
    edit: "மாற்று",
    submitConfirm: "உறுதிசெய்து சமர்ப்பிக்கவும்",
    cancel: "ரத்து செய்",
    confirmPrompt: "உங்கள் விண்ணப்பத்தை அதிகாரப்பூர்வ தளத்தில் சமர்ப்பிக்க உள்ளீர்கள்.",
    successSubmitted: "வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.",
    largestDebit: "அதிகபட்ச செலவு",
    largestCredit: "அதிகபட்ச வரவு",
    allRecords: "அனைத்து பதிவுகள்",
    tableTitle: "பரிவர்த்தனை விவரங்கள்",
    searchPlaceholder: "தேடு...",
    voiceEchoConfirm: "கேட்டது: {value}. இது சரியா?",
    yesCorrect: "ஆம், சரி",
    tryAgain: "மீண்டும் செய்",
  },
};

export function getI18n(lang = "en"): LocalizedDictionary {
  return I18N_STRINGS[lang] || I18N_STRINGS.en;
}
