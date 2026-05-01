const { validateRCA, calculateMTTR } = require('../src/services/stateService');

describe('RCA Validation', () => {
  const validRCA = {
    rootCauseCategory: 'Database Failure',
    fixApplied: 'Restarted the primary DB node',
    preventionSteps: 'Add read replica and auto-failover',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T11:00:00Z',
  };

  test('accepts a complete RCA', () => {
    expect(() => validateRCA(validRCA)).not.toThrow();
  });

  test('rejects RCA missing rootCauseCategory', () => {
    const rca = { ...validRCA, rootCauseCategory: '' };
    expect(() => validateRCA(rca)).toThrow('rootCauseCategory');
  });

  test('rejects RCA missing fixApplied', () => {
    const { fixApplied, ...rca } = validRCA;
    expect(() => validateRCA(rca)).toThrow('fixApplied');
  });

  test('rejects RCA missing preventionSteps', () => {
    const rca = { ...validRCA, preventionSteps: '   ' };
    expect(() => validateRCA(rca)).toThrow('preventionSteps');
  });

  test('rejects RCA missing both time fields', () => {
    const { startTime, endTime, ...rca } = validRCA;
    expect(() => validateRCA(rca)).toThrow();
  });
});

describe('MTTR Calculation', () => {
  test('calculates 60 minutes correctly', () => {
    expect(calculateMTTR('2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z')).toBe(60);
  });

  test('calculates 30 minutes correctly', () => {
    expect(calculateMTTR('2024-01-01T10:00:00Z', '2024-01-01T10:30:00Z')).toBe(30);
  });

  test('returns 0 for same start and end', () => {
    expect(calculateMTTR('2024-01-01T10:00:00Z', '2024-01-01T10:00:00Z')).toBe(0);
  });
});