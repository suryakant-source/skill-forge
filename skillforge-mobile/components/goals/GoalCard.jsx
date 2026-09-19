import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

/** Color map for category badges */
const CATEGORY_COLORS = {
  BACKEND:  { bg: 'rgba(108,99,255,0.18)', text: Colors.primary },
  FRONTEND: { bg: 'rgba(62,207,207,0.18)',  text: Colors.secondary },
  MOBILE:   { bg: 'rgba(72,187,120,0.18)',  text: Colors.success },
  DATABASE: { bg: 'rgba(236,201,75,0.18)',  text: Colors.warning },
  DEVOPS:   { bg: 'rgba(252,129,129,0.18)', text: Colors.error },
  AI_ML:    { bg: 'rgba(160,99,255,0.18)',  text: '#C084FC' },
  DESIGN:   { bg: 'rgba(251,146,60,0.18)',  text: '#FB923C' },
  OTHER:    { bg: 'rgba(160,174,192,0.18)', text: Colors.textMuted },
};

/**
 * GoalCard - Displays a single goal with progress, actions and meta.
 *
 * Props:
 *  goal       - Goal object
 *  onPress    - Navigate to goal detail
 *  onEdit     - Open edit modal
 *  onDelete   - Confirm + delete
 */
export default function GoalCard({ goal, onPress, onEdit, onDelete }) {
  const {
    title = '',
    description = '',
    category = 'OTHER',
    targetDays,
    dailyHours,
    progress = 0,
    taskCount = 0,
    completedTaskCount = 0,
    isCompleted,
    completed,
  } = goal;

  const isDone = isCompleted || completed || progress >= 100;
  const pct = Math.min(progress || 0, 100);
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* ── Top Row: Category Badge + Actions ── */}
      <View style={styles.topRow}>
        <View style={[styles.catBadge, { backgroundColor: catColor.bg }]}>
          <Text style={[styles.catText, { color: catColor.text }]}>{category}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Title & Description ── */}
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      {description ? (
        <Text style={styles.desc} numberOfLines={2}>{description}</Text>
      ) : null}

      {/* ── Meta Row ── */}
      <View style={styles.metaRow}>
        {targetDays ? (
          <Text style={styles.meta}>⏱️ {targetDays} Days</Text>
        ) : null}
        {dailyHours ? (
          <Text style={styles.meta}>📅 {dailyHours} hrs/day</Text>
        ) : null}
        <Text style={styles.meta}>📋 {completedTaskCount}/{taskCount} tasks</Text>
      </View>

      {/* ── Progress Bar ── */}
      <View style={styles.progressRow}>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${pct}%`,
                backgroundColor: isDone ? Colors.success : Colors.secondary,
              },
            ]}
          />
        </View>
        <Text style={[styles.pctText, { color: isDone ? Colors.success : Colors.secondary }]}>
          {pct}%
        </Text>
      </View>

      {/* ── View Tasks CTA ── */}
      <TouchableOpacity style={styles.viewTasksBtn} onPress={onPress}>
        <Ionicons name="list-outline" size={14} color={Colors.primary} />
        <Text style={styles.viewTasksText}>View Tasks</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: 'rgba(252,129,129,0.1)' },
  title: {
    color: Colors.text, fontSize: 16, fontWeight: '700',
    marginBottom: 6, lineHeight: 22,
  },
  desc: {
    color: Colors.textMuted, fontSize: 13,
    lineHeight: 18, marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 12,
  },
  meta: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
  progressRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  barTrack: {
    flex: 1, height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3, overflow: 'hidden', marginRight: 10,
  },
  barFill: { height: '100%', borderRadius: 3 },
  pctText: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  viewTasksBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, alignSelf: 'flex-start',
  },
  viewTasksText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
});
