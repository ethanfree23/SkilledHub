import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <Text style={styles.badge}>On-demand skilled labor</Text>
        <Text style={styles.title}>TechFlash</Text>
        <Text style={styles.sub}>Let&apos;s get the job done.</Text>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnPrimaryText}>Log in</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.btnSecondaryText}>Create account</Text>
          </Pressable>
        </View>
        <Text style={styles.foot}>
          Native app · same account as techflash.app
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(254, 103, 17, 0.12)',
    color: colors.primaryOrange,
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 8,
    fontSize: 18,
    color: colors.muted,
    textAlign: 'center',
  },
  actions: { marginTop: 40, gap: 12 },
  btnPrimary: {
    backgroundColor: colors.primaryOrange,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimaryText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: { color: colors.text, fontSize: 17, fontWeight: '600' },
  pressed: { opacity: 0.92 },
  foot: {
    marginTop: 48,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 13,
  },
});
