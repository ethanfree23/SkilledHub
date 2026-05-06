import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radii, space } from '../../theme';

export type SettingsTabId =
  | 'account'
  | 'profile'
  | 'notifications'
  | 'payment'
  | 'system_controls'
  | 'job_access';

type TabDef = { id: SettingsTabId; label: string };

const ALL_TABS: TabDef[] = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'payment', label: 'Payment' },
];

const ADMIN_EXTRA: TabDef[] = [
  { id: 'system_controls', label: 'System' },
  { id: 'job_access', label: 'Job access' },
];

type Props = {
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
  isAdmin?: boolean;
};

export function SettingsTabBar({ active, onChange, isAdmin }: Props) {
  const tabs = isAdmin ? [...ALL_TABS, ...ADMIN_EXTRA] : ALL_TABS;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: 'row',
    gap: space.sm,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: space.md,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipOn: {
    borderColor: colors.tabActive,
    backgroundColor: colors.primaryBlueMuted,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.tabInactive,
  },
  labelOn: {
    color: colors.tabActive,
  },
});
