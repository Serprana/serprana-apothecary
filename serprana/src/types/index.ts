export interface Herb {
  id: string
  name: string
  spanishName?: string | null
  latinName?: string | null
  description: string
  pricePerOunce: number
  inventoryOunces: number
  tags: string[]
  energetics?: string | null
  taste?: string | null
  partsUsed?: string | null
  contraindications?: string | null
  featured: boolean
  active: boolean
}

export interface RecipeHerb {
  name: string
  parts: number
  notes?: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  tags: string[]
  herbs: RecipeHerb[]
  instructions: string
  featured: boolean
}

export interface TeaBlendHerb {
  herbId: string
  name: string
  scoops: number
  pricePerOunce: number
}

export interface BulkHerbItem {
  herbId: string
  name: string
  ounces: number
  pricePerOunce: number
  subtotal: number
}

export interface OrderItem {
  type: 'tea' | 'bulk'
  items: TeaBlendHerb[] | BulkHerbItem[]
  total: number
}

export interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export const CONDITION_CATEGORIES = [
  { label: 'Digestion', icon: '🌿', tags: ['digestion', 'gut repair', 'IBS', 'bloating', 'nausea'] },
  { label: 'Stress & Anxiety', icon: '🕊️', tags: ['stress', 'anxiety', 'nervous system', 'calming'] },
  { label: 'Sleep', icon: '🌙', tags: ['sleep', 'insomnia', 'deep sleep', 'bedtime'] },
  { label: 'Hormones', icon: '🌸', tags: ['women hormones', 'pms', 'menopause', 'cycle balance'] },
  { label: 'Immune', icon: '🛡️', tags: ['immune', 'cold flu', 'antiviral', 'antimicrobial'] },
  { label: 'Energy', icon: '☀️', tags: ['energy', 'fatigue', 'adrenal support', 'vitality'] },
  { label: 'Detox', icon: '💧', tags: ['detox', 'liver', 'kidney', 'cleanse', 'blood purifier'] },
  { label: 'Inflammation', icon: '🔥', tags: ['inflammation', 'pain relief', 'joint support'] },
  { label: 'Respiratory', icon: '🫁', tags: ['respiratory support', 'lung', 'cough', 'congestion'] },
  { label: 'Focus & Brain', icon: '🧠', tags: ['focus', 'mental clarity', 'memory', 'brain health'] },
  { label: 'Heart', icon: '❤️', tags: ['heart', 'circulation', 'blood pressure'] },
  { label: 'Skin', icon: '✨', tags: ['skin', 'acne', 'eczema', 'anti-aging'] },
  { label: 'Minerals & Nourishment', icon: '🌱', tags: ['minerals', 'nutritive', 'nourishing', 'tonic'] },
  { label: 'Spiritual & Sacred', icon: '🔮', tags: ['meditation', 'sacred', 'ceremonial', 'ritual', 'grounding'] },
]

export const TEA_PRICE = 17
export const SCOOP_TO_OUNCE = 0.01
export const MIN_BULK_OUNCES = 0.5
