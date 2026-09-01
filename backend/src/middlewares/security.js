/**
 * Security Middleware
 * Additional security headers beyond helmet's defaults.
 * Called once at startup — currently a no-op placeholder
 * so index.js can import it without breaking.
 */
export function applySecurityHeaders(app) {
  // Helmet is already applied in index.js.
  // Add any custom headers here if needed.
}
