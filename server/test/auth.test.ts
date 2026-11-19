import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { checkPassword, createToken, hashPassword } from '../src/auth.js';

describe('password hashing', () => {
  it('never stores the password itself', async () => {
    const hash = await hashPassword('supersecret1');
    expect(hash).not.toContain('supersecret1');
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('accepts the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('supersecret1');
    expect(await checkPassword('supersecret1', hash)).toBe(true);
    expect(await checkPassword('wrong-password', hash)).toBe(false);
  });

  it('gives a different hash each time for the same password (salting)', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
});

describe('session tokens', () => {
  it('carries the user id and verifies with the same secret', () => {
    const token = createToken(42, 'test-secret');
    const payload = jwt.verify(token, 'test-secret') as jwt.JwtPayload;
    expect(payload.sub).toBe('42');
  });

  it('fails verification with a different secret', () => {
    const token = createToken(42, 'test-secret');
    expect(() => jwt.verify(token, 'other-secret')).toThrow();
  });
});
