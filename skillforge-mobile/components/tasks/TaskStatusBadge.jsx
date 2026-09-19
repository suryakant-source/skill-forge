import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CONFIG = {
  PENDING:     { bg: 'rgba(236,201,75,0.15)',  text: '#ECC94B', label: 'Pending' },
  IN_PROGRESS: { bg: 'rgba(62,207,207,0.15)',  text: '#3ECFCF', label: 'In Progress' },
  COMPLETED:   { bg: 'rgba(72,187,120,0.15)',  text: '#48BB78', label: 'Completed' },
};

/** Colored pill badge showing the task status */
export default function TaskStatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.PENDING;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
