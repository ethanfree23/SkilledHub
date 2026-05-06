import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function GhostButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.85 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 11,
    alignItems: 'center',
  },
  disabled: { opacity: 0.55 },
  text: { color: colors.text, fontWeight: '600', fontSize: 15, paddingHorizontal: 8, textAlign: 'center' },
});
