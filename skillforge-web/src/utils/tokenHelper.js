/**
 * ============================================================================
 * SKILLFORGE TOKEN & AUTH STORAGE HELPER
 * ============================================================================
 * 
 * Why LocalStorage Is Used:
 * 1. Persistence across Browser Sessions:
 *    Unlike in-memory state (React useState) which resets on every page reload,
 *    localStorage keeps the user's JWT token and cached profile information
 *    persisted until the session expires or the user explicitly logs out.
 * 
 * 2. Instant Access for Axios Interceptors:
 *    Axios requests happen outside the React component lifecycle. Storing the token
 *    in localStorage allows our HTTP interceptors to attach the `Authorization: Bearer <token>`
 *    header synchronously to every outgoing request without needing React hooks.
 * 
 * 3. Client-Side JWT Expiration Check:
 *    By inspecting the `exp` claim stored in the base64-encoded JWT payload, the client
 *    can detect expired sessions before sending unnecessary unauthenticated HTTP calls.
 */

const TOKEN_KEY = 'skillforge_token';
const USER_KEY = 'skillforge_user';

/**
 * Save JWT token into localStorage.
 * @param {string} token - JWT bearer token string.
 */
export const saveToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Alias for saveToken (backward compatibility).
 */
export const setToken = saveToken;

/**
 * Retrieve saved JWT token from localStorage.
 * @returns {string|null} - The token string or null if not found.
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove JWT token from localStorage.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Save user profile object as JSON into localStorage.
 * @param {object} user - User metadata (id/userId, name, email, role, etc.).
 */
export const saveUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Alias for saveUser (backward compatibility).
 */
export const setUser = saveUser;

/**
 * Retrieve parsed user profile object from localStorage.
 * @returns {object|null} - Parsed user object or null if absent/malformed.
 */
export const getUser = () => {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Remove user profile object from localStorage.
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Clear all authentication-related keys from localStorage.
 */
export const clearAll = () => {
  removeToken();
  removeUser();
};

/**
 * Alias for clearAll (backward compatibility).
 */
export const clearAuth = clearAll;

/**
 * Decode JWT payload and determine if the token has expired.
 * A standard JWT is formatted as `header.payload.signature`.
 * 
 * @param {string} token - The raw JWT token string.
 * @returns {boolean} - True if expired or invalid, false if still active.
 */
export const isTokenExpired = (token) => {
  const targetToken = token || getToken();
  if (!targetToken) return true;

  try {
    const parts = targetToken.split('.');
    if (parts.length !== 3) {
      return true;
    }

    // JWT payload is the 2nd part (base64 URL encoded)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // If 'exp' claim is missing, assume not expired, otherwise compare with current timestamp in seconds
    if (!payload.exp) {
      return false;
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < currentTimeInSeconds;
  } catch (error) {
    console.warn('Error validating JWT expiration token:', error);
    return true;
  }
};

/**
 * Check if the user has a valid, non-expired token.
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token);
};
