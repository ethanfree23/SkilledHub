import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import * as jobsApi from '../api/jobsApi';
import * as adminApi from '../api/adminApi';
import { colors } from '../theme';

function pickJobFields(job: unknown): { title: string; subtitle: string } {
  if (!job || typeof job !== 'object') return { title: 'Job', subtitle: '' };
  const j = job as Record<string, unknown>;
  const title = typeof j.title === 'string' ? j.title : 'Job';
  const status = typeof j.status === 'string' ? j.status : '';
  const id = typeof j.id === 'number' ? j.id : '';
  const subtitle = [status && `Status: ${status}`, id && `#${id}`].filter(Boolean).join(' · ');
  return { title, subtitle };
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<{ title: string; data: unknown[] }[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      if (user.role === 'company') {
        const d = await jobsApi.getCompanyDashboardJobs();
        const req = Array.isArray(d.requested) ? d.requested : [];
        const unreq = Array.isArray(d.unrequested) ? d.unrequested : [];
        const exp = Array.isArray(d.expired) ? d.expired : [];
        setSections([
          { title: 'Claimed / in progress', data: req },
          { title: 'Open', data: unreq },
          { title: 'Completed', data: exp },
        ]);
      } else if (user.role === 'technician') {
        const d = await jobsApi.getTechnicianDashboardJobs();
        setSections([
          { title: 'In progress', data: d.in_progress || [] },
          { title: 'Completed', data: d.completed || [] },
        ]);
      } else {
        const categories = ['total_users', 'companies', 'technicians', 'total_jobs'];
        const insights = await Promise.all(categories.map((c) => adminApi.getPlatformInsight(c, '7d')));
        const data = insights.filter(Boolean).map((insight, idx) => ({
          id: idx + 1,
          title: String((insight as Record<string, unknown>).label || categories[idx]),
          status: '7d',
        }));
        setSections([{ title: 'Platform overview', data }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load jobs');
      setSections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const displaySections = sections.filter((s) => s.data.length > 0);

  if (!user) return null;

  if (loading && displaySections.length === 0 && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
        </View>
      ) : null}
      <SectionList
        sections={displaySections}
        keyExtractor={(item, index) => {
          if (item && typeof item === 'object' && 'id' in item && typeof (item as { id: unknown }).id === 'number') {
            return String((item as { id: number }).id);
          }
          return `row-${index}`;
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryOrange} />
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const { title, subtitle } = pickJobFields(item);
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{title}</Text>
              {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {user.role === 'admin'
              ? ''
              : 'No jobs here yet. Pull down to refresh.'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(254, 103, 17, 0.12)',
  },
  bannerText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardSub: { marginTop: 6, fontSize: 14, color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40, paddingHorizontal: 24 },
});
