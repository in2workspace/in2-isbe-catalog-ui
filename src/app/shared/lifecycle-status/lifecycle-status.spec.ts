import {LIFECYCLE_STATES,normalizeToInternal,normalizeToExternal,allowedTargets,displayedFromAnchor,canTransitionFromAnchor,hasNonStatusChanges} from './lifecycle-status';
import { describe, expect } from '@jest/globals';

describe('lifecycle-status', () => {
describe('normalizeToInternal', () => {
  test('returns empty string for null/undefined/empty', () => {
    expect(normalizeToInternal(null)).toBe('');
    expect(normalizeToInternal(undefined)).toBe('');
    expect(normalizeToInternal('')).toBe('');
  });

  test('accepts internal codes (already lower_snake_case)', () => {
    expect(normalizeToInternal('in_design')).toBe('in_design');
    expect(normalizeToInternal('launched')).toBe('launched');
  });

  test('accepts external labels and capitalised forms', () => {
    expect(normalizeToInternal('In design')).toBe('in_design');
    expect(normalizeToInternal('Launched')).toBe('launched');
    expect(normalizeToInternal('Launched ')).toBe('');
  });
});

describe('normalizeToExternal', () => {
  test('maps internal code to external label or empty for empty input', () => {
    expect(normalizeToExternal('active')).toBe('Active');
    expect(normalizeToExternal('')).toBe('');
  });
});

describe('allowedTargets', () => {
  test('generic transitions include launched from in_design', () => {
    expect(allowedTargets('spec', 'in_design', true)).toEqual(['active', 'launched']);
  });

  test('offering transitions restrict launched when allowLaunched is false', () => {
    expect(allowedTargets('offering', 'in_design', true)).toEqual(['active']);
    expect(allowedTargets('offering', 'active', false)).toEqual(['retired']);
  });

  test('unknown from state returns empty array', () => {
    // @ts-expect-error deliberate wrong state to test fallback
    expect(allowedTargets('spec', 'nonexistent_state', true)).toEqual([]);
  });
});

describe('displayedFromAnchor', () => {
  const base = LIFECYCLE_STATES;

  test('generic model shows anchor plus one-hop targets', () => {
    expect(displayedFromAnchor(base, 'in_design', 'spec', true)).toEqual(['in_design', 'active', 'launched']);
  });

  test('offering model hides launched when allowLaunched is false (unless anchor is launched)', () => {
    expect(displayedFromAnchor(base, 'active', 'offering', false)).toEqual(['active', 'retired']);
    expect(displayedFromAnchor(base, 'launched', 'offering', false)).toEqual(['launched', 'active', 'retired']);
  });
});

describe('canTransitionFromAnchor', () => {
  test('same anchor is allowed', () => {
    expect(canTransitionFromAnchor('spec', 'active', 'active', true)).toBe(true);
  });

  test('checks allowed targets respecting allowLaunched', () => {
    expect(canTransitionFromAnchor('spec', 'in_design', 'launched', true)).toBe(true);
    expect(canTransitionFromAnchor('offering', 'in_design', 'launched', false)).toBe(false);
  });
});

describe('hasNonStatusChanges', () => {
  test('returns false when original or current missing', () => {
    expect(hasNonStatusChanges(null, {})).toBe(false);
    expect(hasNonStatusChanges({}, null)).toBe(false);
  });

  test('returns false when original.status is not "Launched"', () => {
    const original = { status: 'Active', name: 'A' };
    const current = { status: 'Active', name: 'B' };
    expect(hasNonStatusChanges(original, current)).toBe(false);
  });

  test('compares objects ignoring key order and detects no change', () => {
    const original = { status: 'Launched', a: 1, b: 2 };
    const current = { b: 2, a: 1, status: 'Launched' };
    expect(hasNonStatusChanges(original, current)).toBe(false);
  });

  test('detects non-status changes when original.status is "Launched"', () => {
    const original = { status: 'Launched', title: 'Old' };
    const current = { status: 'Launched', title: 'New' };
    expect(hasNonStatusChanges(original, current)).toBe(true);
  });
});
});