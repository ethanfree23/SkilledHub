import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { createJob } from '../api/jobsApi';
import type { AppStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList, 'CreateJob'>;

export default function CreateJobScreen() {
  const navigation = useNavigation<Nav>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledStartAt, setScheduledStartAt] = useState('');
  const [scheduledEndAt, setScheduledEndAt] = useState('');
  const [budgetCents, setBudgetCents] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const created = await createJob({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        scheduled_start_at: scheduledStartAt.trim() || undefined,
        scheduled_end_at: scheduledEndAt.trim() || undefined,
        budget_cents: budgetCents.trim() ? Number(budgetCents) : undefined,
      });
      const id = Number((created as Record<string, unknown>)?.id);
      if (id) navigation.replace('JobDetail', { jobId: id });
      else navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      <Field label="Location" value={location} onChangeText={setLocation} />
      <Field label="Scheduled start (ISO datetime)" value={scheduledStartAt} onChangeText={setScheduledStartAt} />
      <Field label="Scheduled end (ISO datetime)" value={scheduledEndAt} onChangeText={setScheduledEndAt} />
      <Field label="Budget cents" value={budgetCents} onChangeText={setBudgetCents} />
      <Pressable style={styles.btn} onPress={onCreate} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Creating...' : 'Create job'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        autoCapitalize="none"
        multiline={multiline}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  error: { color: colors.danger, marginBottom: 8 },
  label: { marginTop: 10, marginBottom: 4, color: colors.muted, textTransform: 'uppercase', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  btn: {
    marginTop: 16,
    backgroundColor: colors.primaryOrange,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700' },
});
