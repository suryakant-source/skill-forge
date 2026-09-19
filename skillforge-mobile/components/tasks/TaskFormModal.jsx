/**
 * TaskFormModal.jsx - Slide-up modal for creating or editing a task.
 *
 * Props:
 *  visible     - boolean
 *  onClose     - () => void
 *  onSubmit    - (formData) => void
 *  initialData - Task object (null = create mode, object = edit mode)
 *  isLoading   - boolean
 *  goalTitle   - string (context label shown above form)
 */
import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export default function TaskFormModal({ visible, onClose, onSubmit, initialData, isLoading, goalTitle }) {
  const [title, setTitle]      = useState('');
  const [description, setDesc] = useState('');
  const [status, setStatus]    = useState('PENDING');

  // Pre-fill on edit, reset on create
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDesc(initialData.description || '');
      setStatus(initialData.status || 'PENDING');
    } else {
      setTitle('');
      setDesc('');
      setStatus('PENDING');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      ...(initialData ? { status } : {}),
    });
  };

  const isEdit = !!initialData;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.avoidView}
        >
          <View style={styles.sheet}>
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{isEdit ? '✏️ Edit Task' : '📋 New Task'}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Goal context pill */}
            {goalTitle ? (
              <View style={styles.goalPill}>
                <Ionicons name="flag-outline" size={12} color={Colors.primary} />
                <Text style={styles.goalPillText}>{goalTitle}</Text>
              </View>
            ) : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title */}
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Implement JWT filter"
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              {/* Description */}
              <Text style={styles.label}>Notes / Steps</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Task notes or steps..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDesc}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Status chips - only show in edit mode */}
              {isEdit && (
                <>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusRow}>
                    {STATUS_OPTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusChip, status === s && styles.statusChipActive]}
                        onPress={() => setStatus(s)}
                      >
                        <Text style={[styles.statusChipText, status === s && styles.statusChipTextActive]}>
                          {s.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveBtn, (!title.trim() || isLoading) && styles.saveBtnDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim() || isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.saveBtnText}>{isEdit ? 'Update Task' : 'Save Task'} 🚀</Text>
                }
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  avoidView: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '88%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  goalPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16,
  },
  goalPillText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  label: {
    color: Colors.textMuted, fontSize: 12, fontWeight: '600',
    marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text, fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  multiline: { minHeight: 80, paddingTop: 12 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statusChip: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight, alignItems: 'center',
  },
  statusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusChipText: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  statusChipTextActive: { color: '#FFF' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
