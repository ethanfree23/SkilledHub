import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { claimJob, denyJob, extendJob, finishJob, getJobById } from '../api/jobsApi';
import { createConversationForJob } from '../api/conversationsApi';
import { useAuth } from '../auth/AuthContext';
import type { AppStackParamList } from '../navigation/RootNavigator';

type DetailRoute = RouteProp<AppStackParamList, 'JobDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList, 'JobDetail'>;

export default function JobDetailScreen() {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { jobId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [job, setJob] = useState<Record<string, unknown>>({});
  const [preferredStartAt, setPreferredStartAt] = useState('');
  const [extendEndAt, setExtendEndAt] = useState('');
  const [technicianProfileId, setTechnicianProfileId] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getJobById(jobId);
      setJob((data || {}) as Record<string, unknown>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load job');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const onClaim = async () => {
    setSaving(true);
    setError('');
    try {
      await claimJob(jobId, preferredStartAt || undefined);
      setNotice('Job claimed.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not claim job');
    } finally {
      setSaving(false);
    }
  };

  const onFinish = async () => {
    setSaving(true);
    setError('');
    try {
      await finishJob(jobId);
      setNotice('Job finished.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not finish job');
    } finally {
      setSaving(false);
    }
  };

  const onDeny = async () => {
    setSaving(true);
    setError('');
    try {
      await denyJob(jobId);
      setNotice('Claim denied.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not deny claim');
    } finally {
      setSaving(false);
    }
  };

  const onExtend = async () => {
    if (!extendEndAt.trim()) {
      setError('Enter new scheduled end datetime (ISO).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await extendJob(jobId, extendEndAt.trim());
      setNotice('Job extended.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not extend job');
    } finally {
      setSaving(false);
    }
  };

  const onStartConversation = async () => {
    setSaving(true);
    setError('');
    try {
      const conversation = await createConversationForJob(
        jobId,
        technicianProfileId.trim() ? Number(technicianProfileId) : undefined
      );
      const id = Number((conversation as Record<string, unknown>)?.id);
      if (!id) throw new Error('Conversation creation failed');
      navigation.navigate('Conversation', { conversationId: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start conversation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryOrange} /></View>;
  }

  const isTech = user?.role === 'technician';
  const isCompanyOrAdmin = user?.role === 'company' || user?.role === 'admin';

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!notice && <Text style={styles.notice}>{notice}</Text>}
      <View style={styles.card}>
        <Text style={styles.title}>{String(job.title || `Job #${job.id}`)}</Text>
        <Text style={styles.sub}>{String(job.description || '')}</Text>
        <Text style={styles.sub}>Status: {String(job.status || 'unknown')}</Text>
        <Text style={styles.sub}>Location: {String(job.location || '')}</Text>
        <TextInput
          value={technicianProfileId}
          onChangeText={setTechnicianProfileId}
          placeholder="Technician profile id (optional for company/admin)"
          placeholderTextColor={colors.muted}
          style={[styles.input, { marginTop: 10 }]}
          autoCapitalize="none"
        />
        <Pressable style={styles.btnGhost} onPress={onStartConversation} disabled={saving}>
          <Text style={styles.btnGhostText}>Open conversation</Text>
        </Pressable>
      </View>

      {isTech ? (
        <View style={styles.card}>
          <Text style={styles.section}>Technician actions</Text>
          <TextInput
            value={preferredStartAt}
            onChangeText={setPreferredStartAt}
            placeholder="Preferred start (optional ISO datetime)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="none"
          />
          <Pressable style={styles.btn} onPress={onClaim} disabled={saving}>
            <Text style={styles.btnText}>{saving ? 'Working...' : 'Claim job'}</Text>
          </Pressable>
          <Pressable style={styles.btnGhost} onPress={onFinish} disabled={saving}>
            <Text style={styles.btnGhostText}>Finish job</Text>
          </Pressable>
        </View>
      ) : null}

      {isCompanyOrAdmin ? (
        <View style={styles.card}>
          <Text style={styles.section}>Company/admin actions</Text>
          <Pressable style={styles.btnGhost} onPress={() => navigation.navigate('EditJob', { jobId })}>
            <Text style={styles.btnGhostText}>Edit job</Text>
          </Pressable>
          <Pressable style={styles.btnGhost} onPress={onFinish} disabled={saving}>
            <Text style={styles.btnGhostText}>Finish job</Text>
          </Pressable>
          <Pressable style={styles.btnGhost} onPress={onDeny} disabled={saving}>
            <Text style={styles.btnGhostText}>Deny claim</Text>
          </Pressable>
          <TextInput
            value={extendEndAt}
            onChangeText={setExtendEndAt}
            placeholder="New end datetime (ISO)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="none"
          />
          <Pressable style={styles.btn} onPress={onExtend} disabled={saving}>
            <Text style={styles.btnText}>{saving ? 'Working...' : 'Extend job'}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  section: { color: colors.text, fontWeight: '700', marginBottom: 8 },
  sub: { color: colors.muted, marginTop: 5 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: colors.primaryOrange,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  btnText: { color: colors.white, fontWeight: '700' },
  btnGhost: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnGhostText: { color: colors.text, fontWeight: '600' },
  error: { color: colors.danger, marginBottom: 8 },
  notice: { color: colors.primaryBlue, marginBottom: 8 },
});
