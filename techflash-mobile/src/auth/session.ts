import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'tf_user_json';

export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const json = JSON.parse(atob(b64 + pad));
    if (!json.exp) return false;
    return json.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export async function getStoredUserJson(): Promise<string | null> {
  return AsyncStorage.getItem(USER_KEY);
}

export async function setStoredUserJson(json: string | null): Promise<void> {
  if (json) await AsyncStorage.setItem(USER_KEY, json);
  else await AsyncStorage.removeItem(USER_KEY);
}
