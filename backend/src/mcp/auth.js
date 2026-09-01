/**
 * MCP Authentication Helper
 * Reuses the existing JWT infrastructure — no duplication.
 * Every MCP tool receives `userId` extracted from the Bearer token.
 */
import jwt from 'jsonwebtoken';

/**
 * Extract and verify the JWT from an HTTP Authorization header.
 * Returns the decoded userId string, or throws on failure.
 * @param {import('express').Request} req
 * @returns {string} userId
 */
export function extractUserFromRequest(req) {
  let token = null;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.query?.token) {
    token = req.query.token;
  }
  if (!token) {
    throw new Error('MCP_AUTH_MISSING: Authorization header or token query parameter required');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return String(decoded.sub);
  } catch (err) {
    throw new Error(`MCP_AUTH_INVALID: ${err.message}`);
  }
}

/**
 * Middleware factory for Express routes that host MCP transports.
 * Attaches `req.mcpUserId` so transport handlers can pass it to tools.
 * Non-blocking — passes the request through even if no token is present
 * (individual tools enforce auth by calling extractUserFromRequest themselves).
 */
export function mcpAuthMiddleware(req, res, next) {
  try {
    req.mcpUserId = extractUserFromRequest(req);
  } catch {
    req.mcpUserId = null; // tools will throw if they need auth
  }
  next();
}
