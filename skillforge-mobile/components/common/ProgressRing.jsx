import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

/**
 * ProgressRing - Circular progress indicator using border trick
 * Pure React Native implementation (no SVG required)
 * 
 * @param {number} progress - Progress value 0-100
 * @param {number} size - Ring diameter in px (default 80)
 * @param {number} strokeWidth - Ring thickness (default 8)
 * @param {string} color - Active ring color
 * @param {string} label - Center label text
 */
export default function ProgressRing({
  progress = 0,
  size = 80,
  strokeWidth = 8,
  color = Colors.primary,
  label = '',
}) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const innerSize = size - strokeWidth * 2;

  // Simulate ring via two half-circles (rotation trick)
  const rotate1 = safeProgress <= 50
    ? -90 + (safeProgress / 50) * 180
    : 90;
  const rotate2 = safeProgress > 50
    ? -90 + ((safeProgress - 50) / 50) * 180
    : -90;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Background track */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: Colors.surfaceLight,
          },
        ]}
      />
      {/* Progress fill - simplified linear gradient via opacity */}
      <View
        style={[
          styles.ring,
          styles.progressRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            opacity: safeProgress === 0 ? 0 : 1,
            // Rotate to represent fill
          },
        ]}
      />
      {/* Center content */}
      <View
        style={[
          styles.center,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <Text style={[styles.percentage, { color }]}>{safeProgress}%</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  progressRing: {
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  center: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1,
  },
});
