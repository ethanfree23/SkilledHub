import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

const keyFor = (role: 'company' | 'technician') => `tf_push_opt_in_${role}`;

export async function getPushOptIn(role: 'company' | 'technician'): Promise<boolean> {
  const v = await AsyncStorage.getItem(keyFor(role));
  return v === 'true';
}

export async function setPushOptIn(role: 'company' | 'technician', enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(keyFor(role), enabled ? 'true' : 'false');
}

export async function requestExpoPushPermissions(): Promise<Notifications.PermissionStatus> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return existing.status;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.status;
}

export function openSystemSettings(): void {
  Linking.openSettings();
}
