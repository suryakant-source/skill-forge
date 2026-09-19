import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

/**
 * StatsCard - Reusable metric display card
 * @param {string} label - Card label
 * @param {string|number} value - Metric value
 * @param {string} icon - Ionicons icon name
 * @param {string} iconColor - Icon tint color
 * @param {string} iconBg - Icon background color
 * @param {function} onPress - Optional press handler
 * @param {string} trend - Optional trend label (e.g. "+2 this week")
 */
export default function StatsCard({ label, value, icon, iconColor, iconBg, onPress, trend }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg || 'rgba(108, 99, 255, 0.15)' }]}>
        <Ionicons name={icon || 'analytics'} size={20} color={iconColor || Colors.primary} />
      </View>
      <Text style={styles.value}>{value ?? '-'}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend ? <Text style={styles.trend}>{trend}</Text> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  trend: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
});
