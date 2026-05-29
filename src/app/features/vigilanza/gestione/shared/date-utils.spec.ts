import { describe, it, expect } from 'vitest';
import { toDateString } from './date-utils';

describe('toDateString utility', () => {
  describe('valid Date objects', () => {
    it('should convert Date object to YYYY-MM-DD format', () => {
      const date = new Date(2026, 4, 29); // May 29, 2026
      expect(toDateString(date)).toBe('2026-05-29');
    });

    it('should zero-pad month and day', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(toDateString(date)).toBe('2026-01-05');
    });

    it('should handle leap year dates', () => {
      const date = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
      expect(toDateString(date)).toBe('2024-02-29');
    });

    it('should handle year-end dates', () => {
      const date = new Date(2025, 11, 31); // Dec 31, 2025
      expect(toDateString(date)).toBe('2025-12-31');
    });

    it('should handle year-start dates', () => {
      const date = new Date(2026, 0, 1); // Jan 1, 2026
      expect(toDateString(date)).toBe('2026-01-01');
    });
  });

  describe('valid ISO strings', () => {
    it('should accept and convert ISO string', () => {
      expect(toDateString('2026-05-29')).toBe('2026-05-29');
    });

    it('should accept ISO string with time component', () => {
      expect(toDateString('2026-05-29T10:30:00Z')).toBe('2026-05-29');
    });

    it('should handle different ISO formats', () => {
      expect(toDateString('2026-05-29T00:00:00')).toBe('2026-05-29');
    });
  });

  describe('invalid inputs (should return null)', () => {
    it('should return null for null', () => {
      expect(toDateString(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(toDateString(undefined)).toBeNull();
    });

    it('should return null for invalid date string', () => {
      expect(toDateString('invalid-date')).toBeNull();
    });

    it('should return null for nonsense string', () => {
      expect(toDateString('xyz')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(toDateString('')).toBeNull();
    });

    it('should return null for Invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(toDateString(invalidDate)).toBeNull();
    });
  });

  describe('round-trip conversions', () => {
    it('should handle string → Date → string round trip', () => {
      const original = '2026-05-29';
      const date = new Date(original);
      const result = toDateString(date);
      expect(result).toBe(original);
    });

    it('should be idempotent (string in, string out = same)', () => {
      const input = '2026-05-29';
      const first = toDateString(input);
      const second = toDateString(first);
      expect(first).toBe(second);
      expect(second).toBe(input);
    });
  });

  describe('edge cases', () => {
    it('should handle different century dates', () => {
      const date = new Date(1970, 0, 1); // Unix epoch
      expect(toDateString(date)).toBe('1970-01-01');
    });

    it('should handle future dates', () => {
      const date = new Date(2099, 11, 31);
      expect(toDateString(date)).toBe('2099-12-31');
    });

    it('should handle dates with timezone offset', () => {
      // This tests that the function handles timezone-aware dates correctly
      const dateStr = '2026-05-29T00:00:00+02:00';
      const result = toDateString(dateStr);
      // Result depends on local timezone, but should not be null
      expect(result).not.toBeNull();
    });
  });
});
