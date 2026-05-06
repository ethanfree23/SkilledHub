import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primaryOrange} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <Text style={styles.empty}>{label}</Text>;
}

export function ErrorState({ error }: { error: string }) {
  if (!error) return null;
  return <Text style={styles.error}>{error}</Text>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, gap: 10 },
  muted: { color: colors.muted },
  empty: { marginTop: 30, textAlign: 'center', color: colors.muted },
  error: { color: colors.danger, marginBottom: 8 },
});
