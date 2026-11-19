import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

export const SESSION_COOKIE = 'session';

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function checkPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: number, secret: string): string {
  return jwt.sign({ sub: String(userId) }, secret, { expiresIn: '1h' });
}

/** Only lets the request through if it carries a valid session cookie. Puts the user's id in res.locals.userId. */
export function requireAuth(secret: string): RequestHandler {
  return (req, res, next) => {
    const token = req.cookies?.[SESSION_COOKIE];
    try {
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      res.locals.userId = Number(payload.sub);
      next();
    } catch {
      res.status(401).json({ error: 'Not signed in' });
    }
  };
}
