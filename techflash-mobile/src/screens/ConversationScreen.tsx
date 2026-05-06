import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import { getConversation } from '../api/conversationsApi';
import { createMessage, listMessages, type MessageRow } from '../api/messagesApi';
import type { AppStackParamList } from '../navigation/RootNavigator';

type ConvRoute = RouteProp<AppStackParamList, 'Conversation'>;

export default function ConversationScreen() {
  const route = useRoute<ConvRoute>();
  const { conversationId } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState<Record<string, unknown>>({});
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [conv, msgs] = await Promise.all([
        getConversation(conversationId),
        listMessages(conversationId),
      ]);
      setConversation(conv as Record<string, unknown>);
      setMessages(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load conversation');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [conversationId]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const isFeedbackThread =
    conversation.conversation_type === 'feedback' || conversation.inbox_category === 'feedback';

  const onSend = async () => {
    if (!draft.trim() || isFeedbackThread) return;
    setSaving(true);
    setError('');
    try {
      await createMessage(conversationId, draft.trim());
      setDraft('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send message');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryOrange} /></View>;
  }

  return (
    <View style={styles.root}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {isFeedbackThread ? (
        <Text style={styles.info}>Feedback thread is read-only.</Text>
      ) : null}
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primaryOrange} />}
        contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.msgCard}>
            <Text style={styles.msgMeta}>
              {String(item.sender_display_name || item.sender_type || 'Sender')}
            </Text>
            <Text style={styles.msgBody}>{String(item.content || '')}</Text>
          </View>
        )}
      />
      {!isFeedbackThread ? (
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type message..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <Pressable style={[styles.send, saving && { opacity: 0.7 }]} onPress={onSend} disabled={saving}>
            <Text style={styles.sendText}>{saving ? '...' : 'Send'}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  error: { color: colors.danger, marginHorizontal: 14, marginTop: 10 },
  info: { color: colors.muted, marginHorizontal: 14, marginTop: 10 },
  empty: { marginTop: 20, textAlign: 'center', color: colors.muted },
  msgCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  msgMeta: { color: colors.muted, fontSize: 12, marginBottom: 4 },
  msgBody: { color: colors.text, fontSize: 15 },
  composer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    backgroundColor: colors.white,
    minHeight: 38,
    maxHeight: 100,
  },
  send: {
    backgroundColor: colors.primaryOrange,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendText: { color: colors.white, fontWeight: '700' },
});
