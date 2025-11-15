/**
 * Corrections Hook
 *
 * Manages corrections state and provides methods to request
 * AI-driven corrections from the backend
 */

import { useState, useCallback } from 'react';
import type { Correction, CorrectionSummary } from '../types/corrections';
import { generateCorrectionId } from '../types/corrections';

export const useCorrections = () => {
  const [corrections, setCorrections] = useState<CorrectionSummary[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Request corrections for a user message
   * This will call the AI backend to analyze the message
   */
  const requestCorrections = useCallback(
    async (messageId: string, userMessage: string, aiResponse?: string) => {
      setIsAnalyzing(true);

      try {
        // TODO: Call backend API to get AI-generated corrections
        // For now, we'll return empty array (will integrate with backend later)
        // const response = await apiClient.getCorrections(messageId, userMessage, aiResponse);

        // Placeholder for backend integration
        const mockCorrections: Correction[] = [];

        // Example of what corrections might look like (commented out for now):
        /*
        const mockCorrections: Correction[] = [
          {
            id: generateCorrectionId(),
            type: 'grammar',
            severity: 'error',
            original: 'Yo quiero un cafe',
            corrected: 'Yo quiero un café',
            explanation: 'Remember to use the accent mark on "café". Without it, the word means something different.',
            rule: 'Spanish accents change pronunciation and meaning',
            examples: [
              'café (coffee) vs cafe (I brew)',
              'té (tea) vs te (you)',
            ],
          },
        ];
        */

        if (mockCorrections.length > 0) {
          const summary: CorrectionSummary = {
            messageId,
            userMessage,
            corrections: mockCorrections,
            overallScore: calculateScore(mockCorrections),
            timestamp: new Date(),
          };

          setCorrections((prev) => [...prev, summary]);
          return summary;
        }

        return null;
      } catch (error) {
        console.error('Failed to get corrections:', error);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  /**
   * Acknowledge a correction (mark as seen/learned)
   */
  const acknowledgeCorrection = useCallback((correctionId: string) => {
    setCorrections((prev) =>
      prev.map((summary) => ({
        ...summary,
        corrections: summary.corrections.map((correction) =>
          correction.id === correctionId
            ? { ...correction, acknowledged: true }
            : correction
        ),
      }))
    );
  }, []);

  /**
   * Dismiss a correction (hide it)
   */
  const dismissCorrection = useCallback((correctionId: string) => {
    setCorrections((prev) =>
      prev.map((summary) => ({
        ...summary,
        corrections: summary.corrections.filter((c) => c.id !== correctionId),
      }))
    );
  }, []);

  /**
   * Clear all corrections
   */
  const clearAllCorrections = useCallback(() => {
    setCorrections([]);
  }, []);

  /**
   * Get corrections for a specific message
   */
  const getCorrectionsForMessage = useCallback(
    (messageId: string): CorrectionSummary | undefined => {
      return corrections.find((summary) => summary.messageId === messageId);
    },
    [corrections]
  );

  /**
   * Get all unacknowledged corrections
   */
  const getUnacknowledgedCorrections = useCallback((): Correction[] => {
    const allCorrections: Correction[] = [];
    corrections.forEach((summary) => {
      summary.corrections.forEach((correction) => {
        if (!correction.acknowledged) {
          allCorrections.push(correction);
        }
      });
    });
    return allCorrections;
  }, [corrections]);

  /**
   * Get correction statistics
   */
  const getStats = useCallback(() => {
    const total = corrections.reduce((sum, s) => sum + s.corrections.length, 0);
    const acknowledged = corrections.reduce(
      (sum, s) => sum + s.corrections.filter((c) => c.acknowledged).length,
      0
    );
    const byType = corrections.reduce(
      (acc, summary) => {
        summary.corrections.forEach((correction) => {
          acc[correction.type] = (acc[correction.type] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total,
      acknowledged,
      unacknowledged: total - acknowledged,
      byType,
    };
  }, [corrections]);

  return {
    corrections,
    isAnalyzing,
    requestCorrections,
    acknowledgeCorrection,
    dismissCorrection,
    clearAllCorrections,
    getCorrectionsForMessage,
    getUnacknowledgedCorrections,
    getStats,
  };
};

/**
 * Calculate overall score based on corrections
 * Fewer/less severe corrections = higher score
 */
function calculateScore(corrections: Correction[]): number {
  if (corrections.length === 0) return 100;

  let penalties = 0;
  corrections.forEach((correction) => {
    if (correction.severity === 'error') {
      penalties += 15;
    } else if (correction.severity === 'suggestion') {
      penalties += 5;
    } else {
      penalties += 2;
    }
  });

  return Math.max(0, 100 - penalties);
}
