import { ScenarioMission } from '../types';

export const SCENARIOS: ScenarioMission[] = [
  // BEGINNER SCENARIOS
  {
    id: 'cafe-order-beginner',
    title: 'Order Coffee at a Café',
    description: 'Practice ordering your favorite drink at a local café. Learn to ask questions, make modifications, and handle payment.',
    difficulty: 'beginner',
    category: 'shopping',
    objectives: [
      'Greet the barista',
      'Order a specific drink',
      'Ask about sizes and prices',
      'Confirm your order'
    ],
    estimatedDuration: 5,
    requiredVocabulary: ['hello', 'coffee', 'please', 'thank you', 'how much', 'size'],
    culturalNotes: [
      'In many countries, tipping culture varies. Research local customs.',
      'Coffee sizes may have different names in different regions.'
    ]
  },
  {
    id: 'directions-beginner',
    title: 'Ask for Directions',
    description: 'You\'re lost in a new city. Ask locals for help finding your way to a landmark.',
    difficulty: 'beginner',
    category: 'travel',
    objectives: [
      'Politely get someone\'s attention',
      'Ask where a specific place is',
      'Understand basic directional phrases',
      'Thank the person for their help'
    ],
    estimatedDuration: 5,
    requiredVocabulary: ['excuse me', 'where', 'left', 'right', 'straight', 'thank you'],
    culturalNotes: [
      'Body language and gestures can help when vocabulary is limited.',
      'Learn the polite forms of address in your target language.'
    ]
  },

  // ELEMENTARY SCENARIOS
  {
    id: 'restaurant-reservation',
    title: 'Make a Restaurant Reservation',
    description: 'Call a restaurant to book a table. Handle questions about party size, time, and special requests.',
    difficulty: 'elementary',
    category: 'social',
    objectives: [
      'State your purpose (making a reservation)',
      'Specify date, time, and number of people',
      'Answer questions about preferences',
      'Confirm the reservation details'
    ],
    estimatedDuration: 7,
    requiredVocabulary: ['reservation', 'table', 'people', 'evening', 'available', 'confirm'],
    culturalNotes: [
      'Phone etiquette varies by culture.',
      'Learn how to express dates and times properly.'
    ]
  },
  {
    id: 'market-negotiation',
    title: 'Negotiate at a Street Market',
    description: 'Practice haggling for souvenirs at a local market. Learn to discuss prices and qualities.',
    difficulty: 'elementary',
    category: 'shopping',
    objectives: [
      'Ask about items and prices',
      'Express that something is too expensive',
      'Make a counter-offer',
      'Reach an agreement or walk away politely'
    ],
    estimatedDuration: 8,
    requiredVocabulary: ['price', 'expensive', 'cheaper', 'quality', 'discount', 'deal'],
    culturalNotes: [
      'Haggling is expected in some cultures but rude in others.',
      'Learn the local currency and number system well.'
    ]
  },

  // INTERMEDIATE SCENARIOS
  {
    id: 'doctor-appointment',
    title: 'Describe Symptoms to a Doctor',
    description: 'You\'re not feeling well. Explain your symptoms to a doctor and understand their advice.',
    difficulty: 'intermediate',
    category: 'emergency',
    objectives: [
      'Describe when symptoms started',
      'Explain what hurts and how it feels',
      'Answer medical history questions',
      'Understand treatment recommendations'
    ],
    estimatedDuration: 10,
    requiredVocabulary: ['pain', 'sick', 'fever', 'medicine', 'symptom', 'prescription'],
    culturalNotes: [
      'Medical systems vary by country.',
      'Important to know emergency phrases.'
    ]
  },
  {
    id: 'job-interview',
    title: 'Job Interview Conversation',
    description: 'Participate in a professional job interview. Discuss your experience, skills, and career goals.',
    difficulty: 'intermediate',
    category: 'business',
    objectives: [
      'Introduce yourself professionally',
      'Describe your work experience',
      'Answer behavioral questions',
      'Ask thoughtful questions about the role'
    ],
    estimatedDuration: 15,
    requiredVocabulary: ['experience', 'skills', 'responsibility', 'achievement', 'team', 'goal'],
    culturalNotes: [
      'Interview etiquette varies significantly across cultures.',
      'Research industry-specific terminology.'
    ]
  },

  // ADVANCED SCENARIOS
  {
    id: 'debate-current-events',
    title: 'Debate Current Events',
    description: 'Engage in a thoughtful debate about a current news topic. Present arguments and respond to challenges.',
    difficulty: 'advanced',
    category: 'social',
    objectives: [
      'Present a clear position with evidence',
      'Respond to counterarguments',
      'Use advanced vocabulary and idioms',
      'Maintain respectful disagreement'
    ],
    estimatedDuration: 20,
    requiredVocabulary: ['argue', 'evidence', 'perspective', 'controversy', 'policy', 'impact'],
    culturalNotes: [
      'Political discussions require cultural sensitivity.',
      'Learn formal debate structures in the target language.'
    ]
  },
  {
    id: 'business-negotiation',
    title: 'Negotiate a Business Deal',
    description: 'Lead a complex business negotiation. Discuss terms, handle objections, and reach an agreement.',
    difficulty: 'advanced',
    category: 'business',
    objectives: [
      'Present a proposal clearly',
      'Negotiate terms and conditions',
      'Handle objections professionally',
      'Close the deal or plan next steps'
    ],
    estimatedDuration: 20,
    requiredVocabulary: ['proposal', 'terms', 'contract', 'negotiate', 'compromise', 'agreement'],
    culturalNotes: [
      'Business culture varies dramatically worldwide.',
      'Understand hierarchy and decision-making processes.'
    ]
  }
];

export const AI_PERSONALITIES = [
  {
    id: 'patient-teacher',
    name: 'Sofia Martinez',
    description: 'A patient and encouraging teacher who speaks slowly and provides detailed explanations',
    personality: 'patient' as const,
    speakingSpeed: 'slow' as const,
    interruptionLikelihood: 0,
    avatar: '👩‍🏫'
  },
  {
    id: 'friendly-peer',
    name: 'Alex Chen',
    description: 'A friendly conversation partner around your age who keeps things casual and fun',
    personality: 'friendly' as const,
    speakingSpeed: 'normal' as const,
    interruptionLikelihood: 0.2,
    avatar: '🧑'
  },
  {
    id: 'challenging-coach',
    name: 'Marco Rossi',
    description: 'A demanding coach who pushes you to improve and doesn\'t let mistakes slide',
    personality: 'challenging' as const,
    speakingSpeed: 'fast' as const,
    interruptionLikelihood: 0.4,
    avatar: '👨‍💼'
  },
  {
    id: 'formal-professional',
    name: 'Dr. Tanaka Yuki',
    description: 'A formal professional for business and academic contexts',
    personality: 'formal' as const,
    speakingSpeed: 'normal' as const,
    interruptionLikelihood: 0.1,
    avatar: '👔'
  },
  {
    id: 'casual-local',
    name: 'Jean Dupont',
    description: 'A casual local who uses slang and speaks naturally',
    personality: 'casual' as const,
    speakingSpeed: 'fast' as const,
    interruptionLikelihood: 0.3,
    avatar: '🙋'
  }
];
