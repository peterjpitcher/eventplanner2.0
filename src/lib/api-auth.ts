import { createLogger } from './logger';

const logger = createLogger('api-auth');

/**
 * Validates the API auth token from an authorization header
 * 
 * @param authHeader The authorization header value
 * @returns True if the token is valid, false otherwise
 */
export function validateApiAuthToken(authHeader: string | null): boolean {
  if (!authHeader) {
    logger.warn('Missing authorization header');
    return false;
  }

  // Extract token from "Bearer <token>"
  const providedToken = authHeader.replace('Bearer ', '');
  if (!providedToken) {
    logger.warn('Empty token provided');
    return false;
  }

  // Get expected token from environment
  const expectedToken = process.env.API_AUTH_TOKEN;
  
  // Skip validation in development mode if configured
  const skipAuth = process.env.NODE_ENV === 'development' && 
                   process.env.SKIP_API_AUTH === 'true';
  
  if (skipAuth) {
    logger.info('Skipping API auth validation in development mode');
    return true;
  }
  
  if (!expectedToken) {
    logger.error('API_AUTH_TOKEN not configured in environment');
    return false;
  }
  
  const isValid = expectedToken === providedToken;
  if (!isValid) {
    logger.warn('Invalid API token provided');
  }
  
  return isValid;
} 