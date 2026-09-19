/**
 * TaskCard.jsx - Interactive task row with one-tap checkbox.
 *
 * Props:
 *  task           - { id, title, description, status, goalTitle }
 *  onToggleStatus - (taskId, nextStatus) => void
 *  onEdit         - (task) => void
 *  onDelete       - (taskId) => void
 *
 * Tap logic:
 *  PENDING -> IN_PROGRESS -> COMPLETED -> PENDING (cycles on each tap)
 *  But for simplicity: PENDING -> COMPLETED, COMPLETED -> PENDING (toggle)
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import TaskStatusBadge from './TaskStatusBadge';

export default function TaskCard({ task, onToggleStatus, onEdit, onDelete }) {
  const isDone      = task.status === 'COMPLETED';
  const isInProg    = task.status === 'IN_PROGRESS';

  /** Single tap: PENDING -> IN_PROGRESS -> COMPLETED -> PENDING */
  const handleCheckbox = () => {
    const next = isDone ? 'PENDING' : isInProg ? 'COMPLETED' : 'IN_PROGRESS';
    onToggleStatus(task.id, next);
  };

  return (
    <View style={styles.card}>
      {/* ── Row 1: Checkbox + Title + Actions ── */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={handleCheckbox} style={styles.checkboxWrap}>
          <Ionicons
            name={isDone ? 'checkmark-circle' : isInProg ? 'radio-button-on' : 'ellipse-outline'}
            size={26}
            color={isDone ? Colors.success : isInProg ? Colors.secondary : Colors.textMuted}
          />
        </TouchableOpacity>

        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(task)}>
            <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(task.id)}>
            <Ionicons name="trash-outline" size={14} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Row 2: Description ── */}
      {task.description ? (
        <Text style={styles.desc} numberOfLines={2}>{task.description}</Text>
      ) : null}

      {/* ── Row 3: Goal badge + Status badge ── */}
      <View style={styles.metaRow}>
        {task.goalTitle ? (
          <View style={styles.goalBadge}>
            <Ionicons name="flag-outline" size={10} color={Colors.primary} />
            <Text style={styles.goalBadgeText} numberOfLines={1}>{task.goalTitle}</Text>
          </View>
        ) : null}
        <TaskStatusBadge status={task.status || 'PENDING'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  checkboxWrap: { paddingTop: 1 },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: 'rgba(252,129,129,0.1)' },
  desc: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 36,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 36,
    flexWrap: 'wrap',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    maxWidth: 150,
  },
  goalBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});
