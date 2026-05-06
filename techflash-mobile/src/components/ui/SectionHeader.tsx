import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, typography } from '../../theme';

export function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    ...typography.caption,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
});
