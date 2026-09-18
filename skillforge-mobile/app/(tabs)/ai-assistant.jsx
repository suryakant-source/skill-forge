import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import axiosInstance from '../../api/axiosInstance';

const QUICK_PROMPTS = [
  'How do I master Microservices Architecture in 6 months?',
  'What skills should I learn next based on my current goals?',
  'Top 5 System Design interview questions for Senior Backend Engineer',
  'Help me design a study plan for Spring Boot & Kubernetes',
];

export default function AIAssistantScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  const handleSend = async (userPrompt) => {
    const promptToSend = (userPrompt || query).trim();
    if (!promptToSend) return;

    // Add user message to conversation list
    const userMsg = { id: Date.now(), role: 'user', text: promptToSend };
    setConversation((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/ai/recommend', {
        query: promptToSend,
      });

      // Backend returns either string or { recommendation: "..." }
      const reply =
        response?.data?.recommendation ||
        response?.recommendation ||
        response?.data ||
        response?.message ||
        'No advice received.';

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: typeof reply === 'string' ? reply : JSON.stringify(reply, null, 2),
      };

      setConversation((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('[AI Assistant] Error:', err);
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `⚠️ ${err.message || 'Unable to fetch AI recommendation. Please ensure backend is running.'}`,
        isError: true,
      };
      setConversation((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={14} color={Colors.secondary} />
            <Text style={styles.badgeText}>GROQ CLOUD AI</Text>
          </View>
          <Text style={styles.title}>AI Career Mentor</Text>
          <Text style={styles.subtitle}>
            Personalized advice grounded in your current profile & goals
          </Text>
        </View>

        {/* Conversation / Empty State */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {conversation.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.aiGlowIcon}>
                <Ionicons name="hardware-chip-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Ask Your Personal AI Advisor</Text>
              <Text style={styles.emptyDesc}>
                Tap a suggestion below or type any question regarding roadmap planning,
                tech stack comparison, or interview strategies:
              </Text>

              {/* Quick Prompts */}
              <View style={styles.chipContainer}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleSend(prompt)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="bulb-outline"
                      size={14}
                      color={Colors.secondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.chipText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            conversation.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.msgBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <View style={styles.msgHeader}>
                  <Ionicons
                    name={msg.role === 'user' ? 'person-circle-outline' : 'sparkles'}
                    size={16}
                    color={msg.role === 'user' ? Colors.secondary : Colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.msgRole}>
                    {msg.role === 'user' ? 'You' : 'SkillForge AI Mentor'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.msgText,
                    msg.isError && { color: Colors.error },
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))
          )}

          {loading && (
            <View style={[styles.msgBubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator color={Colors.secondary} size="small" />
              <Text style={styles.loadingText}>Synthesizing personalized recommendation...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask about microservices, system design..."
            placeholderTextColor="#718096"
            value={query}
            onChangeText={setQuery}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!query.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!query.trim() || loading}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(62, 207, 207, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    color: Colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 20,
  },
  aiGlowIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 300,
  },
  chipContainer: {
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
    lineHeight: 16,
  },
  msgBubble: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderColor: 'rgba(108, 99, 255, 0.4)',
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
    width: '100%',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginLeft: 10,
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  msgRole: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  msgText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
