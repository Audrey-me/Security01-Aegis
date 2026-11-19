import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDatabase, createStarterAccount } from './db.js';
import { SESSION_COOKIE, checkPassword, createToken, hashPassword, requireAuth } from './auth.js';

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
if (!databaseUrl || !jwtSecret) {
  throw new Error('DATABASE_URL and JWT_SECRET must be set');
}

const db = await connectDatabase(databaseUrl);
const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(cookieParser());

// Logs the user in by giving the browser a session cookie
function startSession(res: express.Response, userId: number) {
  res.cookie(SESSION_COOKIE, createToken(userId, jwtSecret!), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour, same as the token
  });
}

app.get('/api/health', async (_req, res) => {
  await db.query('SELECT 1');
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, dob, gender } = req.body;

  const existing = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const result = await db.query(
    'INSERT INTO users (email, password_hash, dob, gender) VALUES ($1, $2, $3, $4) RETURNING id, email',
    [email, passwordHash, dob, gender]
  );
  const user = result.rows[0];
  await createStarterAccount(db, user.id);

  startSession(res, user.id);
  res.status(201).json(user);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await checkPassword(password, user.password_hash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  startSession(res, user.id);
  res.json({ id: user.id, email: user.email });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.status(204).end();
});

app.get('/api/me', requireAuth(jwtSecret), async (_req, res) => {
  const result = await db.query('SELECT id, email, dob, gender FROM users WHERE id = $1', [res.locals.userId]);
  res.json(result.rows[0]);
});

app.get('/api/account', requireAuth(jwtSecret), async (_req, res) => {
  const result = await db.query(
    `SELECT a.account_number AS "accountNumber",
            a.balance_cents AS "balanceCents",
            a.savings_cents AS "savingsCents",
            COALESCE(SUM(-t.amount_cents) FILTER (
              WHERE t.amount_cents < 0 AND t.occurred_on >= CURRENT_DATE - 30
            ), 0)::int AS "spendingCents"
       FROM accounts a
       LEFT JOIN transactions t ON t.account_id = a.id
      WHERE a.user_id = $1
      GROUP BY a.id`,
    [res.locals.userId]
  );
  res.json(result.rows[0]);
});

app.get('/api/transactions', requireAuth(jwtSecret), async (_req, res) => {
  const result = await db.query(
    `SELECT t.id, t.merchant, t.category,
            t.amount_cents AS "amountCents",
            to_char(t.occurred_on, 'YYYY-MM-DD') AS date
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
      WHERE a.user_id = $1
      ORDER BY t.occurred_on DESC, t.id DESC`,
    [res.locals.userId]
  );
  res.json(result.rows);
});

// In the Docker image the built React app sits in ./public. Serve it, and
// send index.html for any other page so routes like /dashboard work on refresh.
const staticDir = process.env.STATIC_DIR ?? path.resolve('public');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
