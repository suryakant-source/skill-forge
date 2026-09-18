import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * ============================================================================
 * Token & User Storage Helper (expo-secure-store)
 * ============================================================================
 * Why SecureStore is preferred over AsyncStorage on Mobile:
 * 1. Hardware Encryption:
 *    - iOS: Uses Apple Keychain Services (AES-256 encrypted hardware enclave).
 *    - Android: Encrypted with Android Keystore system and SharedPreferences.
 * 2. Protection Against Jailbreak/Root Extraction:
 *    - AsyncStorage stores data in unencrypted plaintext SQLite/XML files.
 *    - SecureStore prevents token extraction even if device file system is inspected.
 * 3. Security Compliance:
 *    - Essential for storing sensitive JWT authentication tokens and personal data.
 * ============================================================================
 */

const TOKEN_KEY = 'skillforge_token';
const USER_KEY = 'skillforge_user';

/**
 * Helper to safely set item across native and web environments
 */
async function setItem(key, value) {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`[SecureStore] Error saving key "${key}":`, error);
    throw error;
  }
}

/**
 * Helper to safely get item across native and web environments
 */
async function getItem(key) {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`[SecureStore] Error retrieving key "${key}":`, error);
    return null;
  }
}

/**
 * Helper to safely delete item across native and web environments
 */
async function deleteItem(key) {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`[SecureStore] Error deleting key "${key}":`, error);
  }
}

/**
 * Save JWT Auth Token to encrypted storage
 * @param {string} token - JWT Access Token
 */
export async function saveToken(token) {
  if (!token) return;
  await setItem(TOKEN_KEY, token);
}

/**
 * Retrieve JWT Auth Token from encrypted storage
 * @returns {Promise<string|null>}
 */
export async function getToken() {
  return await getItem(TOKEN_KEY);
}

/**
 * Remove JWT Auth Token from encrypted storage
 */
export async function removeToken() {
  await deleteItem(TOKEN_KEY);
}

/**
 * Save current authenticated user profile
 * @param {object} user - User details object
 */
export async function saveUser(user) {
  if (!user) return;
  const serialized = JSON.stringify(user);
  await setItem(USER_KEY, serialized);
}

/**
 * Retrieve current user profile object
 * @returns {Promise<object|null>}
 */
export async function getUser() {
  const data = await getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (parseError) {
    console.error('[SecureStore] Failed to parse stored user json:', parseError);
    return null;
  }
}

/**
 * Remove user profile from encrypted storage
 */
export async function removeUser() {
  await deleteItem(USER_KEY);
}

/**
 * Clear both auth token and user profile on logout or session expiration
 */
export async function clearAll() {
  await Promise.all([removeToken(), removeUser()]);
}

export default {
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  removeUser,
  clearAll,
};
