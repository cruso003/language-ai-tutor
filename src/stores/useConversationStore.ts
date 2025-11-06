import { create } from 'zustand';
import {
  ConversationMessage,
  ConversationSession,
  ScenarioMission,
  AIPersonality,
  GrammarCorrection
} from '../types';

interface ConversationState {
  currentSession: ConversationSession | null;
  isActive: boolean;
  messages: ConversationMessage[];
  recentCorrections: GrammarCorrection[];
  isProcessing: boolean;

  // Actions
  startSession: (mission: ScenarioMission, personality: AIPersonality) => void;
  addMessage: (message: ConversationMessage) => void;
  addCorrections: (corrections: GrammarCorrection[]) => void;
  endSession: (passed: boolean) => void;
  setProcessing: (processing: boolean) => void;
  resetConversation: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  currentSession: null,
  isActive: false,
  messages: [],
  recentCorrections: [],
  isProcessing: false,

  startSession: (mission, personality) => {
    const session: ConversationSession = {
      id: Date.now().toString(),
      missionId: mission.id,
      startTime: new Date(),
      messages: [],
      metrics: {
        responseLatency: 0,
        hesitationCount: 0,
        errorRate: 0,
        vocabularyUsed: 0,
        complexSentences: 0,
        fluencyScore: 0
      },
      aiPersonality: personality,
      completed: false,
      passed: false
    };

    set({
      currentSession: session,
      isActive: true,
      messages: [],
      recentCorrections: []
    });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            messages: [...state.currentSession.messages, message]
          }
        : null
    }));
  },

  addCorrections: (corrections) => {
    set((state) => ({
      recentCorrections: [...corrections]
    }));
  },

  endSession: (passed) => {
    set((state) => {
      if (!state.currentSession) return state;

      return {
        currentSession: {
          ...state.currentSession,
          endTime: new Date(),
          completed: true,
          passed
        },
        isActive: false
      };
    });
  },

  setProcessing: (processing) => {
    set({ isProcessing: processing });
  },

  resetConversation: () => {
    set({
      currentSession: null,
      isActive: false,
      messages: [],
      recentCorrections: [],
      isProcessing: false
    });
  }
}));
