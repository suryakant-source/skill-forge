import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';

/**
 * ============================================================================
 * Auth Gateway Screen (app/index.jsx)
 * ============================================================================
 * Acts as the entry gatekeeper:
 * - Listens to AuthContext initialization state
 * - Automatically routes authenticated users to /(tabs)/dashboard
 * - Automatically routes unauthenticated users to /(auth)/login
 * ============================================================================
 */
export default function AuthGateway() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <View style={styles.brandBox}>
        <Text style={styles.brandLogo}>⚡ SkillForge</Text>
        <Text style={styles.brandTagline}>AI-Powered Career & Learning Acceleration</Text>
      </View>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      <Text style={styles.loadingText}>Initializing workspace...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandLogo: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
