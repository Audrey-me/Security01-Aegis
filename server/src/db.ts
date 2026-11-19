import pg from 'pg';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  dob              DATE NOT NULL,
  gender           TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  balance_cents  INTEGER NOT NULL,
  savings_cents  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id           SERIAL PRIMARY KEY,
  account_id   INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  merchant     TEXT NOT NULL,
  category     TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  occurred_on  DATE NOT NULL
);
`;

export async function connectDatabase(databaseUrl: string): Promise<pg.Pool> {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  await pool.query(SCHEMA);
  return pool;
}

// Demo activity so a brand-new account has something to show on the dashboard
const SAMPLE_TRANSACTIONS = [
  { merchant: 'Coffee Shop', category: 'Food & Drink', amountCents: -450, daysAgo: 1 },
  { merchant: 'Online Store', category: 'Shopping', amountCents: -3527, daysAgo: 3 },
  { merchant: 'Mobile Service', category: 'Bills', amountCents: -4500, daysAgo: 5 },
  { merchant: 'Allowance Deposit', category: 'Income', amountCents: 12500, daysAgo: 8 },
  { merchant: 'Restaurant', category: 'Food & Drink', amountCents: -2875, daysAgo: 12 },
  { merchant: 'Movie Tickets', category: 'Entertainment', amountCents: -2400, daysAgo: 20 },
];

export async function createStarterAccount(db: pg.Pool, userId: number): Promise<void> {
  const account = await db.query(
    'INSERT INTO accounts (user_id, account_number, balance_cents, savings_cents) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, `XXXX-${String(userId).padStart(4, '0')}`, 100000, 5000]
  );
  for (const t of SAMPLE_TRANSACTIONS) {
    await db.query(
      `INSERT INTO transactions (account_id, merchant, category, amount_cents, occurred_on)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - $5::int)`,
      [account.rows[0].id, t.merchant, t.category, t.amountCents, t.daysAgo]
    );
  }
}
