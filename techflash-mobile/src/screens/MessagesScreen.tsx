import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { listConversations, type Conversation } from '../api/conversationsApi';
import type { AppStackParamList } from '../navigation/RootNavigator';
import { EmptyState, ErrorState, LoadingState } from '../components/ScreenStates';
import { Card } from '../components/ui/Card';

type Nav = NativeStackNavigationProp<AppStackParamList, 'MainTabs'>;

export default function MessagesScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Conversation[]>([]);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await listConversations();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  if (loading) {
    return <LoadingState label="Loading inbox..." />;
  }

  return (
    <View style={styles.root}>
      <ErrorState error={error} />
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primaryOrange} />}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        ListEmptyComponent={<EmptyState label="No conversations yet." />}
        renderItem={({ item }) => {
          const title =
            item.inbox_category === 'feedback'
              ? `Feedback ${item.feedback_kind ? `(${item.feedback_kind})` : ''}`
              : item.job_id
                ? `Job #${item.job_id}`
                : `Conversation #${item.id}`;
          const subtitle =
            item.submitter_email ||
            `${String(item.conversation_type || 'thread')} · ${String(item.inbox_category || 'general')}`;
          return (
            <Pressable onPress={() => navigation.navigate('Conversation', { conversationId: item.id })}>
              <Card style={styles.cardWrap}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.sub}>{subtitle}</Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  error: { color: colors.danger, marginHorizontal: 14, marginTop: 10 },
  cardWrap: { marginBottom: 10, paddingVertical: 14 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 4 },
});
