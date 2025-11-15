/**
 * Fluency Tracking Hook
 *
 * Tracks response times, hesitations, and calculates fluency scores
 * Provides real metrics for user progress
 */

import { useState, useCallback } from 'react';

export interface ResponseMetrics {
  responseTime: number; // seconds
  hesitationCount: number;
  fluencyScore: number; // 0-100
  rating: 'excellent' | 'good' | 'okay' | 'slow';
}

export interface SessionMetrics {
  averageResponseTime: number;
  totalResponses: number;
  excellentCount: number;
  goodCount: number;
  okayCount: number;
  slowCount: number;
  fluencyScore: number;
}

export const useFluencyTracking = () => {
  const [responses, setResponses] = useState<ResponseMetrics[]>([]);

  const recordResponse = useCallback((responseTime: number, hesitations: number = 0) => {
    const rating = getRating(responseTime);
    const fluencyScore = calculateFluencyScore(responseTime, hesitations);

    const metrics: ResponseMetrics = {
      responseTime,
      hesitationCount: hesitations,
      fluencyScore,
      rating,
    };

    setResponses((prev) => [...prev, metrics]);

    return metrics;
  }, []);

  const getSessionMetrics = useCallback((): SessionMetrics => {
    if (responses.length === 0) {
      return {
        averageResponseTime: 0,
        totalResponses: 0,
        excellentCount: 0,
        goodCount: 0,
        okayCount: 0,
        slowCount: 0,
        fluencyScore: 0,
      };
    }

    const total = responses.length;
    const avgTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / total;
    const avgScore = responses.reduce((sum, r) => sum + r.fluencyScore, 0) / total;

    const excellentCount = responses.filter((r) => r.rating === 'excellent').length;
    const goodCount = responses.filter((r) => r.rating === 'good').length;
    const okayCount = responses.filter((r) => r.rating === 'okay').length;
    const slowCount = responses.filter((r) => r.rating === 'slow').length;

    return {
      averageResponseTime: avgTime,
      totalResponses: total,
      excellentCount,
      goodCount,
      okayCount,
      slowCount,
      fluencyScore: Math.round(avgScore),
    };
  }, [responses]);

  const resetSession = useCallback(() => {
    setResponses([]);
  }, []);

  return {
    recordResponse,
    getSessionMetrics,
    resetSession,
    responses,
  };
};

/**
 * Calculate fluency score based on response time and hesitations
 * Score: 0-100 (100 = perfect fluency)
 */
function calculateFluencyScore(responseTime: number, hesitations: number): number {
  let score = 100;

  // Penalize slow responses
  if (responseTime > 3) {
    score -= 50; // Major penalty for timeout
  } else if (responseTime > 2) {
    score -= 20; // Moderate penalty
  } else if (responseTime > 1) {
    score -= 10; // Small penalty
  }

  // Penalize hesitations
  score -= hesitations * 5;

  // Bonus for very fast responses
  if (responseTime < 0.5) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get rating label based on response time
 */
function getRating(responseTime: number): 'excellent' | 'good' | 'okay' | 'slow' {
  if (responseTime < 1) return 'excellent';
  if (responseTime < 2) return 'good';
  if (responseTime < 3) return 'okay';
  return 'slow';
}
