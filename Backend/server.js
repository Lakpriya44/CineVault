import { createServer } from 'node:http';
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const port = Number(process.env.PORT || 3001);
const sessionSecret = process.env.SESSION_SECRET || 'cinevault-development-secret';
const sessionDuration = 1000 * 60 * 60 * 24 * 7;

const films = [
  { id: '1', title: 'The Long Goodbye', year: 1973, director: 'Robert Altman', genre: 'Noir', rating: '8.0', runtime: '112m', accent: '#c5a46d', poster: 'NOIR / 73', description: 'A private eye drifts through a sun-bleached Los Angeles that has forgotten how to be honest.' },
  { id: '2', title: 'Chungking Express', year: 1994, director: 'Wong Kar-wai', genre: 'Romance', rating: '8.1', runtime: '102m', accent: '#ef7257', poster: 'HK / 94', description: 'Two lonely cops cross paths with two magnetic women in a city moving too quickly to notice.' },
  { id: '3', title: 'Jeanne Dielman', year: 1975, director: 'Chantal Akerman', genre: 'Drama', rating: '8.0', runtime: '201m', accent: '#b9c9c2', poster: 'HOME / 75', description: 'Three days in the life of a Brussels widow, observed with radical patience and precision.' },
  { id: '4', title: 'Paris, Texas', year: 1984, director: 'Wim Wenders', genre: 'Drama', rating: '8.1', runtime: '145m', accent: '#e2a35e', poster: 'ROAD / 84', description: 'A mysterious drifter walks back into his family and toward the landscape of his past.' },
  { id: '5', title: 'Perfect Days', year: 2023, director: 'Wim Wenders', genre: 'Slice of life', rating: '7.9', runtime: '123m', accent: '#8ba9a3', poster: 'TOKYO / 23', description: 'Routine becomes a quiet form of freedom for a Tokyo public toilet cleaner.' },
  { id: '6', title: 'The Red Shoes', year: 1948, director: 'Michael Powell', genre: 'Musical', rating: '8.1', runtime: '133m', accent: '#c8493e', poster: 'STAGE / 48', description: 'Art, desire, and ambition collide behind the velvet curtain of a ballet company.' }
];

const usersFile = new URL('./users.json', import.meta.url);
const users = new Map();
const sessions = new Map();
const demoPasswordSalt = 'cinevault-demo-salt';

if (existsSync(usersFile)) {
  for (const user of JSON.parse(readFileSync(usersFile, 'utf8'))) users.set(user.email, user);
}
if (!users.has('demo@cinevault.test')) {
  users.set('demo@cinevault.test', {
    id: 'user-demo',
    email: 'demo@cinevault.test',
    name: 'Alex Jordan',
    passwordHash: scryptSync('cinevault', demoPasswordSalt, 64).toString('hex'),
    passwordSalt: demoPasswordSalt
  });
}

function saveUsers() {
  writeFileSync(usersFile, JSON.stringify([...users.values()], null, 2));
}

saveUsers();

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  response.end(JSON.stringify(body));
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function createSession(userId, remember) {
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (remember ? sessionDuration : 1000 * 60 * 60 * 8);
  const signature = createHmac('sha256', sessionSecret).update(`${sessionId}.${userId}.${expiresAt}`).digest('hex');
  sessions.set(sessionId, { userId, expiresAt, signature });
  return `${sessionId}.${userId}.${expiresAt}.${signature}`;
}

function getUser(request) {
  const token = parseCookies(request).cinevault_session;
  if (!token) return null;
  const [sessionId, userId, expiresAt, signature] = token.split('.');
  const session = sessions.get(sessionId);
  if (!session || session.userId !== userId || Number(expiresAt) < Date.now() || session.signature !== signature) {
    sessions.delete(sessionId);
    return null;
  }
  const expected = createHmac('sha256', sessionSecret).update(`${sessionId}.${userId}.${expiresAt}`).digest('hex');
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  return [...users.values()].find((user) => user.id === userId) || null;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; if (body.length > 10_000) reject(new Error('Request body too large')); });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
    request.on('error', reject);
  });
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  response.setHeader('Cache-Control', 'no-store');

  try {
    if (request.method === 'GET' && url.pathname === '/api/films') {
      if (!getUser(request)) return sendJson(response, 401, { error: 'Not authenticated' });
      return sendJson(response, 200, films);
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/me') {
      const user = getUser(request);
      return user ? sendJson(response, 200, { user: publicUser(user) }) : sendJson(response, 401, { error: 'Not authenticated' });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
      const body = await readBody(request);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (name.length < 2 || !email.includes('@') || password.length < 8) {
        return sendJson(response, 400, { error: 'Use a name, valid email, and password with at least 8 characters' });
      }
      if (users.has(email)) return sendJson(response, 409, { error: 'An account with that email already exists' });
      const passwordSalt = randomBytes(16).toString('hex');
      const user = {
        id: `user-${randomBytes(12).toString('hex')}`,
        email,
        name,
        passwordHash: scryptSync(password, passwordSalt, 64).toString('hex'),
        passwordSalt
      };
      users.set(email, user);
      saveUsers();
      const token = createSession(user.id, Boolean(body.remember));
      const maxAge = body.remember ? `; Max-Age=${sessionDuration / 1000}` : '';
      return sendJson(response, 201, { user: publicUser(user) }, { 'Set-Cookie': `cinevault_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax${maxAge}` });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readBody(request);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = users.get(email);
      const passwordHash = user ? scryptSync(password, user.passwordSalt, 64).toString('hex') : '';
      const valid = user && passwordHash.length === user.passwordHash.length && timingSafeEqual(Buffer.from(passwordHash), Buffer.from(user.passwordHash));
      if (!valid) return sendJson(response, 401, { error: 'Invalid email or password' });
      const token = createSession(user.id, Boolean(body.remember));
      const maxAge = body.remember ? `; Max-Age=${sessionDuration / 1000}` : '';
      return sendJson(response, 200, { user: publicUser(user) }, { 'Set-Cookie': `cinevault_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax${maxAge}` });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      const token = parseCookies(request).cinevault_session;
      if (token) sessions.delete(token.split('.')[0]);
      return sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'cinevault_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0' });
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    sendJson(response, 400, { error: error.message || 'Request failed' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`CineVault API running at http://127.0.0.1:${port}`);
  console.log('Development login: demo@cinevault.test / cinevault');
});
