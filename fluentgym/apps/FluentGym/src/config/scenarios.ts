/**
 * Scenario System Configuration
 *
 * Real-world conversation scenarios with objectives and success criteria
 * Each scenario provides context, vocabulary, and learning goals
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ScenarioObjective {
  id: string;
  description: string;
  required: boolean; // Must complete to pass scenario
}

export interface Scenario {
  id: string;
  name: string;
  icon: string; // Ionicons name
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: number; // minutes

  // Context
  setting: string;
  roleDescription: string; // User's role in the scenario

  // Learning goals
  objectives: ScenarioObjective[];
  keyPhrases: string[]; // Important phrases to use
  vocabularyHints: string[]; // Words to know

  // AI tutor instructions
  systemPrompt: string;
  initialGreeting: string;

  // Success criteria
  minExchanges: number; // Minimum back-and-forth exchanges
  targetFluencyScore: number; // 0-100
  requiredPhrases?: string[]; // Phrases user should use
}

/**
 * 8 Core Real-World Scenarios
 */
export const SCENARIOS: Record<string, Scenario> = {
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant Order',
    icon: 'restaurant',
    description: 'Order food and drinks at a restaurant',
    difficulty: 'beginner',
    estimatedTime: 5,

    setting: 'You are at a Spanish restaurant in Madrid. The waiter approaches your table.',
    roleDescription: 'Customer ordering a meal',

    objectives: [
      {
        id: 'greet',
        description: 'Greet the waiter',
        required: true,
      },
      {
        id: 'order-drink',
        description: 'Order a beverage',
        required: true,
      },
      {
        id: 'order-food',
        description: 'Order a main course',
        required: true,
      },
      {
        id: 'ask-question',
        description: 'Ask about menu item or recommendation',
        required: false,
      },
      {
        id: 'request-bill',
        description: 'Request the bill',
        required: true,
      },
    ],

    keyPhrases: [
      'Quisiera...',
      'Me gustaría...',
      '¿Qué recomienda?',
      'La cuenta, por favor',
    ],

    vocabularyHints: [
      'agua - water',
      'vino - wine',
      'pollo - chicken',
      'pescado - fish',
      'cuenta - bill',
    ],

    systemPrompt: `You are a friendly Spanish waiter at a restaurant in Madrid. Help the customer order food in Spanish. Be patient but encourage them to speak Spanish. If they struggle, provide gentle hints. Keep responses natural and conversational. Track whether they complete these tasks: greet you, order drinks, order food, ask questions, request the bill.`,

    initialGreeting: '¡Buenas tardes! Bienvenido a nuestro restaurante. ¿Qué le gustaría tomar?',

    minExchanges: 4,
    targetFluencyScore: 60,
  },

  airport: {
    id: 'airport',
    name: 'Airport Navigation',
    icon: 'airplane',
    description: 'Check in, go through security, find your gate',
    difficulty: 'intermediate',
    estimatedTime: 7,

    setting: 'You are at Barcelona Airport checking in for your flight to Valencia.',
    roleDescription: 'Traveler checking in for a domestic flight',

    objectives: [
      {
        id: 'check-in',
        description: 'Complete check-in process',
        required: true,
      },
      {
        id: 'baggage',
        description: 'Ask about baggage allowance',
        required: true,
      },
      {
        id: 'gate',
        description: 'Ask where your gate is',
        required: true,
      },
      {
        id: 'time',
        description: 'Confirm boarding time',
        required: false,
      },
    ],

    keyPhrases: [
      '¿Dónde está...?',
      'Mi vuelo a...',
      '¿Cuántas maletas puedo llevar?',
      '¿A qué hora sale el vuelo?',
    ],

    vocabularyHints: [
      'vuelo - flight',
      'maleta - suitcase',
      'puerta - gate',
      'tarjeta de embarque - boarding pass',
      'equipaje - baggage',
    ],

    systemPrompt: `You are a helpful check-in agent at Barcelona Airport. Assist the traveler with checking in for their flight to Valencia. Be professional but friendly. Guide them through the process naturally in Spanish.`,

    initialGreeting: 'Buenos días. ¿En qué puedo ayudarle hoy?',

    minExchanges: 5,
    targetFluencyScore: 65,
  },

  jobInterview: {
    id: 'jobInterview',
    name: 'Job Interview',
    icon: 'briefcase',
    description: 'Interview for a position at a Spanish company',
    difficulty: 'advanced',
    estimatedTime: 10,

    setting: 'You are interviewing for a marketing position at a tech company in Madrid.',
    roleDescription: 'Job candidate in an interview',

    objectives: [
      {
        id: 'introduce',
        description: 'Introduce yourself professionally',
        required: true,
      },
      {
        id: 'experience',
        description: 'Describe your work experience',
        required: true,
      },
      {
        id: 'skills',
        description: 'Explain your relevant skills',
        required: true,
      },
      {
        id: 'ask-question',
        description: 'Ask a question about the company',
        required: false,
      },
    ],

    keyPhrases: [
      'Tengo experiencia en...',
      'He trabajado como...',
      'Mis habilidades incluyen...',
      '¿Podría contarme más sobre...?',
    ],

    vocabularyHints: [
      'experiencia - experience',
      'habilidades - skills',
      'puesto - position',
      'empresa - company',
      'equipo - team',
    ],

    systemPrompt: `You are a hiring manager at a tech company in Madrid interviewing a candidate for a marketing position. Be professional and ask typical interview questions in Spanish. Assess their qualifications naturally through conversation.`,

    initialGreeting: 'Buenos días. Gracias por venir. Cuéntame un poco sobre ti y tu experiencia.',

    minExchanges: 6,
    targetFluencyScore: 75,
  },

  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'cart',
    description: 'Buy clothes and accessories at a store',
    difficulty: 'beginner',
    estimatedTime: 5,

    setting: 'You are shopping for clothes at a boutique in Barcelona.',
    roleDescription: 'Customer shopping for clothes',

    objectives: [
      {
        id: 'greet',
        description: 'Greet the shop assistant',
        required: true,
      },
      {
        id: 'ask-item',
        description: 'Ask for a specific item',
        required: true,
      },
      {
        id: 'size-color',
        description: 'Specify size or color preference',
        required: true,
      },
      {
        id: 'try-on',
        description: 'Ask to try something on',
        required: false,
      },
      {
        id: 'purchase',
        description: 'Complete the purchase',
        required: true,
      },
    ],

    keyPhrases: [
      'Busco...',
      '¿Tiene esto en talla...?',
      '¿Puedo probármelo?',
      '¿Cuánto cuesta?',
    ],

    vocabularyHints: [
      'talla - size',
      'color - color',
      'probador - fitting room',
      'pagar - to pay',
      'precio - price',
    ],

    systemPrompt: `You are a friendly shop assistant at a clothing boutique in Barcelona. Help the customer find what they're looking for and complete their purchase. Be helpful and patient.`,

    initialGreeting: '¡Hola! Bienvenido. ¿En qué puedo ayudarle?',

    minExchanges: 4,
    targetFluencyScore: 60,
  },

  doctor: {
    id: 'doctor',
    name: "Doctor's Visit",
    icon: 'medkit',
    description: 'Describe symptoms and get medical advice',
    difficulty: 'intermediate',
    estimatedTime: 8,

    setting: 'You have a doctor appointment at a clinic in Valencia. You are not feeling well.',
    roleDescription: 'Patient at a medical appointment',

    objectives: [
      {
        id: 'greet',
        description: 'Greet the doctor',
        required: true,
      },
      {
        id: 'describe-symptoms',
        description: 'Describe your symptoms',
        required: true,
      },
      {
        id: 'answer-questions',
        description: 'Answer the doctor\'s questions',
        required: true,
      },
      {
        id: 'understand-advice',
        description: 'Understand the doctor\'s advice',
        required: true,
      },
    ],

    keyPhrases: [
      'Me duele...',
      'Tengo dolor de...',
      'Me siento...',
      '¿Qué debo hacer?',
    ],

    vocabularyHints: [
      'dolor - pain',
      'cabeza - head',
      'estómago - stomach',
      'fiebre - fever',
      'medicina - medicine',
    ],

    systemPrompt: `You are a caring doctor at a clinic in Valencia. A patient has come in not feeling well. Ask about their symptoms, provide medical advice, and be reassuring. Keep language clear and simple for a patient who may be stressed.`,

    initialGreeting: 'Buenos días. Siéntese, por favor. ¿Qué le pasa hoy?',

    minExchanges: 5,
    targetFluencyScore: 65,
  },

  socializing: {
    id: 'socializing',
    name: 'Making Friends',
    icon: 'people',
    description: 'Meet someone new and have a friendly conversation',
    difficulty: 'beginner',
    estimatedTime: 6,

    setting: 'You are at a language exchange meetup in Madrid and want to make new friends.',
    roleDescription: 'Someone meeting new people at a social event',

    objectives: [
      {
        id: 'introduce',
        description: 'Introduce yourself',
        required: true,
      },
      {
        id: 'ask-about-them',
        description: 'Ask about the other person',
        required: true,
      },
      {
        id: 'share-interests',
        description: 'Share your interests or hobbies',
        required: true,
      },
      {
        id: 'make-plans',
        description: 'Suggest meeting again',
        required: false,
      },
    ],

    keyPhrases: [
      'Me llamo...',
      '¿De dónde eres?',
      'Me gusta...',
      '¿Quieres tomar un café algún día?',
    ],

    vocabularyHints: [
      'nombre - name',
      'país - country',
      'hobbies - hobbies',
      'trabajo - work/job',
      'estudiar - to study',
    ],

    systemPrompt: `You are a friendly person at a language exchange meetup in Madrid. You're excited to meet new people and practice languages. Be warm, ask questions, and share about yourself naturally.`,

    initialGreeting: '¡Hola! Soy Ana. Es mi primera vez aquí. ¿Y tú?',

    minExchanges: 5,
    targetFluencyScore: 60,
  },

  business: {
    id: 'business',
    name: 'Business Meeting',
    icon: 'business',
    description: 'Participate in a professional business meeting',
    difficulty: 'advanced',
    estimatedTime: 10,

    setting: 'You are attending a quarterly business review meeting at your company in Barcelona.',
    roleDescription: 'Team member presenting project updates',

    objectives: [
      {
        id: 'present-update',
        description: 'Present your project update',
        required: true,
      },
      {
        id: 'discuss-challenges',
        description: 'Discuss challenges or obstacles',
        required: true,
      },
      {
        id: 'propose-solution',
        description: 'Propose a solution or next steps',
        required: true,
      },
      {
        id: 'answer-questions',
        description: 'Answer questions from colleagues',
        required: false,
      },
    ],

    keyPhrases: [
      'El proyecto está...',
      'Hemos completado...',
      'Un desafío es...',
      'Propongo que...',
    ],

    vocabularyHints: [
      'proyecto - project',
      'equipo - team',
      'plazo - deadline',
      'presupuesto - budget',
      'objetivo - objective',
    ],

    systemPrompt: `You are a manager leading a quarterly business review meeting in Barcelona. Ask team members to present updates, discuss challenges, and plan next steps. Be professional but collaborative.`,

    initialGreeting: 'Buenos días a todos. Empecemos con las actualizaciones de proyectos. ¿Quién quiere comenzar?',

    minExchanges: 6,
    targetFluencyScore: 80,
  },

  emergency: {
    id: 'emergency',
    name: 'Emergency Help',
    icon: 'warning',
    description: 'Ask for help in an urgent situation',
    difficulty: 'intermediate',
    estimatedTime: 5,

    setting: 'You are in Madrid and need to report a lost wallet to the police.',
    roleDescription: 'Person reporting a lost item to authorities',

    objectives: [
      {
        id: 'explain-problem',
        description: 'Explain the emergency or problem',
        required: true,
      },
      {
        id: 'provide-details',
        description: 'Provide necessary details',
        required: true,
      },
      {
        id: 'ask-help',
        description: 'Ask what to do next',
        required: true,
      },
      {
        id: 'understand-instructions',
        description: 'Understand the instructions given',
        required: true,
      },
    ],

    keyPhrases: [
      'Necesito ayuda',
      'He perdido...',
      '¿Qué debo hacer?',
      '¿Dónde puedo...?',
    ],

    vocabularyHints: [
      'ayuda - help',
      'perdido - lost',
      'cartera - wallet',
      'policía - police',
      'documento - document',
    ],

    systemPrompt: `You are a helpful police officer at a station in Madrid. Someone has come in to report a lost wallet. Be calm, professional, and guide them through the process. Speak clearly and be patient.`,

    initialGreeting: 'Buenos días. ¿En qué puedo ayudarle?',

    minExchanges: 4,
    targetFluencyScore: 70,
  },
};

/**
 * Get scenario by ID
 */
export const getScenarioById = (id: string): Scenario | undefined => {
  return SCENARIOS[id];
};

/**
 * Get all scenarios as array
 */
export const SCENARIO_LIST = Object.values(SCENARIOS);

/**
 * Get scenarios by difficulty level
 */
export const getScenariosByDifficulty = (difficulty: DifficultyLevel): Scenario[] => {
  return SCENARIO_LIST.filter((s) => s.difficulty === difficulty);
};

/**
 * Get beginner-friendly scenarios
 */
export const getBeginnerScenarios = (): Scenario[] => {
  return getScenariosByDifficulty('beginner');
};
