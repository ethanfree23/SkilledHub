import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, space, radii, typography } from '../theme';
import { Card } from '../components/ui/Card';
import { adminUpdateTierConfig, adminListTierConfigs } from '../api/adminSystemApi';
import { buildTierUpdatePayload, rowFromTier, type JobAccessRow } from '../utils/jobAccessPayload';
import { PrimaryButton } from '../components/ui/PrimaryButton';

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

export default function AdminJobAccessScreen() {
  const [rows, setRows] = useState<JobAccessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const list = await adminListTierConfigs('technician');
      setRows(list.map((t) => rowFromTier(t as Record<string, unknown>)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const updateRow = (id: number, patch: Partial<JobAccessRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const updateFeat = (
    id: number,
    key: keyof JobAccessRow['additionalFeatures'],
    value: string | boolean
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              additionalFeatures: { ...r.additionalFeatures, [key]: value },
            }
          : r
      )
    );
  };

  const onSaveAll = async () => {
    setSaving(true);
    setError('');
    try {
      for (const row of rows) {
        await adminUpdateTierConfig(row.id, buildTierUpdatePayload(row));
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={typography.title}>Job access (technician tiers)</Text>
      <Text style={styles.help}>
        Controls visibility gates per tier (same fields as web). Save applies all rows.
      </Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton label={saving ? 'Saving...' : 'Save all tiers'} onPress={onSaveAll} loading={saving} />

      {rows.map((row) => (
        <Card key={row.id}>
          <Text style={typography.heading}>Tier #{row.id}</Text>
          <Field
            label="Hours after go-live"
            value={row.accessAfterLiveHours}
            onChange={(v) => updateRow(row.id, { accessAfterLiveHours: v })}
          />
          <Field
            label="Min experience years"
            value={row.additionalFeatures.minimumExperienceYears}
            onChange={(v) => updateFeat(row.id, 'minimumExperienceYears', v)}
          />
          <Field
            label="Min jobs completed"
            value={row.additionalFeatures.minimumJobsCompleted}
            onChange={(v) => updateFeat(row.id, 'minimumJobsCompleted', v)}
          />
          <Field
            label="Min successful jobs"
            value={row.additionalFeatures.minimumSuccessfulJobs}
            onChange={(v) => updateFeat(row.id, 'minimumSuccessfulJobs', v)}
          />
          <Field
            label="Min profile completeness %"
            value={row.additionalFeatures.minimumProfileCompletenessPercent}
            onChange={(v) => updateFeat(row.id, 'minimumProfileCompletenessPercent', v)}
          />
          <View style={styles.row}>
            <Text style={styles.label}>Verified background</Text>
            <Pressable
              onPress={() =>
                updateFeat(
                  row.id,
                  'requiresVerifiedBackground',
                  !row.additionalFeatures.requiresVerifiedBackground
                )
              }
            >
              <Text style={styles.toggle}>
                {row.additionalFeatures.requiresVerifiedBackground ? 'Yes' : 'No'}
              </Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  help: { color: colors.muted, marginBottom: space.md, lineHeight: 20 },
  error: { color: colors.danger, marginBottom: 8 },
  field: { marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '600', color: colors.muted, marginBottom: 4, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 16,
    color: colors.text,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  toggle: { color: colors.primaryBlue, fontWeight: '700' },
});
