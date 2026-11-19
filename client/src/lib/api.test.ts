import { describe, expect, it } from 'vitest';
import { formatCents } from './api';

describe('formatCents', () => {
  it('turns cents into dollars', () => {
    expect(formatCents(100000)).toBe('$1,000.00');
    expect(formatCents(450)).toBe('$4.50');
  });
});
