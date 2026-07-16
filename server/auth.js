const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sistema-rrhh-secret-dev';
const SALT_ROUNDS = 10;

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authMiddleware(req, res) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'Token requerido' }));
    return false;
  }
  try {
    const token = header.slice(7);
    req.user = verifyToken(token);
    return true;
  } catch (e) {
    res.writeHead(401, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'Token inválido o expirado' }));
    return false;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, authMiddleware };
