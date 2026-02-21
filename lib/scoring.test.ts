// Unit tests for scoring logic
// Run with: npm test (after setting up Jest)

import { calculateScore, getConfidenceLevel } from './scoring';

describe('Scoring System', () => {
  describe('calculateScore', () => {
    it('should calculate high score for strong alignment across all criteria', () => {
      const signals = {
        market: ['B2B SaaS', 'Enterprise software'],
        stage: ['Series A', '$2M ARR'],
        geography: ['San Francisco'],
        traction: ['Revenue growth', 'Customer logos', 'Team expansion', 'Product launches'],
      };

      const result = calculateScore(signals, 'B2B SaaS', 'Series A', 'San Francisco');
      
      expect(result.totalScore).toBeGreaterThanOrEqual(85);
      expect(result.confidence).toBe('High');
    });

    it('should handle empty signals gracefully', () => {
      const signals = {
        market: [],
        stage: [],
        geography: [],
        traction: [],
      };

      const result = calculateScore(signals, 'B2B SaaS', 'Series A', 'San Francisco');
      
      expect(result.totalScore).toBe(0);
      expect(result.confidence).toBe('Low');
    });

    it('should reduce traction weight when confidence is low', () => {
      const lowSignals = {
        market: ['B2B SaaS'],
        stage: [],
        geography: [],
        traction: [], // Only 1 total signal = Low confidence
      };

      const result = calculateScore(lowSignals, 'B2B SaaS', 'Series A', 'San Francisco');
      
      // With low confidence, traction weight should be reduced
      expect(result.breakdown.traction.weight).toBeLessThan(30);
    });

    it('should handle partial alignment correctly', () => {
      const signals = {
        market: ['B2B SaaS'],
        stage: ['Seed'], // Partial match for Series A
        geography: ['New York'], // Partial match for San Francisco
        traction: ['Revenue growth'],
      };

      const result = calculateScore(signals, 'B2B SaaS', 'Series A', 'San Francisco');
      
      expect(result.totalScore).toBeGreaterThan(30);
      expect(result.totalScore).toBeLessThan(70);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return High for 4+ signals', () => {
      expect(getConfidenceLevel(4)).toBe('High');
      expect(getConfidenceLevel(10)).toBe('High');
    });

    it('should return Medium for 2-3 signals', () => {
      expect(getConfidenceLevel(2)).toBe('Medium');
      expect(getConfidenceLevel(3)).toBe('Medium');
    });

    it('should return Low for 0-1 signals', () => {
      expect(getConfidenceLevel(0)).toBe('Low');
      expect(getConfidenceLevel(1)).toBe('Low');
    });
  });
});
