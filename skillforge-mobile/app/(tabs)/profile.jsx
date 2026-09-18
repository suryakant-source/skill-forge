import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to sign out?')) {
        await confirmLogout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out of SkillForge?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: confirmLogout },
      ]);
    }
  };

  const apiEndpoint = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'SkillForge User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'developer@skillforge.io'}</Text>

          {/* Role Badge */}
          <View style={styles.roleBadge}>
            <Ionicons
              name={user?.role === 'ADMIN' ? 'shield-checkmark' : 'person'}
              size={14}
              color={user?.role === 'ADMIN' ? Colors.warning : Colors.secondary}
            />
            <Text
              style={[
                styles.roleText,
                { color: user?.role === 'ADMIN' ? Colors.warning : Colors.secondary },
              ]}
            >
              {user?.role || 'USER'} ACCOUNT
            </Text>
          </View>
        </View>

        {/* Sync & Device Connectivity Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mobile Sync & Connectivity</Text>
          <View style={styles.infoRow}>
            <Ionicons name="wifi-outline" size={18} color={Colors.secondary} />
            <Text style={styles.infoLabel}>Backend API:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {apiEndpoint}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="phone-portrait-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoLabel}>Client:</Text>
            <Text style={styles.infoValue}>Expo Router + SecureStore</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="sync-outline" size={18} color={Colors.success} />
            <Text style={styles.infoLabel}>Database Sync:</Text>
            <Text style={styles.infoValue}>PostgreSQL (Spring Boot)</Text>
          </View>
        </View>

        {/* Settings & Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences & Support</Text>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.text} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Text style={styles.settingStatus}>Enabled</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={20} color={Colors.text} />
              <Text style={styles.settingText}>App Theme</Text>
            </View>
            <Text style={styles.settingStatus}>Ultra Dark</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.text} />
              <Text style={styles.settingText}>Version</Text>
            </View>
            <Text style={styles.settingStatus}>1.0.0-rc1</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out of SkillForge</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 10,
    width: 95,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
  },
  settingStatus: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(252, 129, 129, 0.12)',
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});
