import { describe, expect, it } from 'vitest';
import { baseFormSchema, personalInfoSchema } from './SignUpSchemas';

describe('sign-up form validation', () => {
  it('accepts a valid email and password', () => {
    expect(baseFormSchema.safeParse({ email: 'teen@example.com', password: 'supersecret1' }).success).toBe(true);
  });

  it('rejects a short password', () => {
    expect(baseFormSchema.safeParse({ email: 'teen@example.com', password: 'short' }).success).toBe(false);
  });

  it('rejects a date in the wrong format', () => {
    const result = personalInfoSchema.safeParse({ dob: '12-04-2000', gender: 'female' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid date of birth and gender', () => {
    const result = personalInfoSchema.safeParse({ dob: '2000/04/12', gender: 'female' });
    expect(result.success).toBe(true);
  });
});
