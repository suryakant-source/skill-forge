import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

const CATEGORIES = ['BACKEND', 'FRONTEND', 'MOBILE', 'DATABASE', 'DEVOPS', 'AI_ML', 'DESIGN', 'OTHER'];

/**
 * GoalFormModal - Slide-up modal for creating or editing a goal.
 *
 * Props:
 *  visible      - boolean
 *  onClose      - () => void
 *  onSubmit     - (formData) => void
 *  initialData  - Goal object for editing (null for create)
 *  isLoading    - boolean (shows spinner on Save button)
 */
export default function GoalFormModal({ visible, onClose, onSubmit, initialData, isLoading }) {
  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [category, setCategory]     = useState('BACKEND');
  const [targetDays, setTargetDays] = useState('30');
  const [dailyHours, setDailyHours] = useState('2');

  // Pre-fill fields when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDesc(initialData.description || '');
      setCategory(initialData.category || 'BACKEND');
      setTargetDays(String(initialData.targetDays || '30'));
      setDailyHours(String(initialData.dailyHours || '2'));
    } else {
      setTitle(''); setDesc(''); setCategory('BACKEND');
      setTargetDays('30'); setDailyHours('2');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      targetDays: parseInt(targetDays) || 30,
      dailyHours: parseFloat(dailyHours) || 2,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.avoidView}
        >
          <View style={styles.sheet}>
            {/* ── Handle bar ── */}
            <View style={styles.handle} />

            {/* ── Header ── */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {initialData ? '✏️ Edit Goal' : '🎯 New Goal'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* ── Title ── */}
              <Text style={styles.label}>Goal Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Master Spring Boot 3"
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              {/* ── Description ── */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Describe your learning objective..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDesc}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* ── Category Chips ── */}
              <Text style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsRow}
                contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      category === cat && styles.chipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ── Target Days & Daily Hours ── */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Target Days</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor={Colors.textMuted}
                    value={targetDays}
                    onChangeText={setTargetDays}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Daily Hours</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2"
                    placeholderTextColor={Colors.textMuted}
                    value={dailyHours}
                    onChangeText={setDailyHours}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* ── Save Button ── */}
              <TouchableOpacity
                style={[styles.saveBtn, (!title.trim() || isLoading) && styles.saveBtnDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {initialData ? 'Update Goal' : 'Save Goal'} 🚀
                  </Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  avoidView: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '92%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  label: {
    color: Colors.textMuted, fontSize: 12, fontWeight: '600',
    marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text, fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 16,
  },
  multiline: { minHeight: 80, paddingTop: 12 },
  chipsRow: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  row: { flexDirection: 'row' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
