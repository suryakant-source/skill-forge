import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import Colors from '../constants/colors';

/**
 * ============================================================================
 * SkillForge Mobile - Root Layout (_layout.jsx)
 * ============================================================================
 * Expo Router Layout Conventions:
 * 1. Global Hierarchy:
 *    - Wraps every child route with top-level context providers (React Query, Auth, SafeArea).
 * 2. Slot & Stack Routing:
 *    - The <Stack> component manages native transition animations between screens.
 *    - Route groups like (auth) and (tabs) are ignored in URL paths but define logical boundaries.
 * 3. Consistent Dark Theme:
 *    - Stack screen options enforce background color #0F0F1A to avoid light flash transitions.
 * ============================================================================
 */

export default function RootLayout() {
  // Single QueryClient instance for caching server state across the mobile app
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar style="light" backgroundColor={Colors.background} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'fade',
              }}
            >
              {/* Auth Gateway Check */}
              <Stack.Screen name="index" />

              {/* (auth) Group: Login & Signup */}
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />

              {/* (tabs) Group: Dashboard, Goals, Tasks, AI, Profile */}
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />

              {/* Goal Detail Dynamic Stack Route */}
              <Stack.Screen
                name="goal-detail/[id]"
                options={{
                  headerShown: false,
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
          </View>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
