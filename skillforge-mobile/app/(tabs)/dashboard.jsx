import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch Dashboard Statistics
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const statsRes = await axiosInstance.get('/dashboard/stats');
        return statsRes?.data || statsRes;
      } catch (e) {
        // Fallback calculation if stats endpoint is not defined
        const goals = await axiosInstance.get('/goals');
        const list = Array.isArray(goals) ? goals : (Array.isArray(goals?.data) ? goals.data : []);
        const totalGoals = list.length;
        const isGoalDone = (g) => Boolean(g.isCompleted || g.completed || (g.progress != null && g.progress >= 100));
        const completedGoals = list.filter(isGoalDone).length;
        const inProgressGoals = list.filter((g) => !isGoalDone(g)).length;
        return {
          totalGoals,
          completedGoals,
          inProgressGoals,
          overallProgress: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
        };
      }
    },
  });

  // Fetch Active Goals for Preview
  const { data: goals = [], isLoading: goalsLoading, refetch: refetchGoals } = useQuery({
    queryKey: ['dashboard-recent-goals'],
    queryFn: async () => {
      const res = await axiosInstance.get('/goals');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      return list.slice(0, 3);
    },
  });

  const onRefresh = () => {
    refetchStats();
    refetchGoals();
  };

  const loading = statsLoading || goalsLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.secondary]}
          />
        }
      >
        {/* User Greeting Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Developer'} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.avatarText}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Sync Badge */}
        <View style={styles.syncCard}>
          <View style={styles.syncPulse} />
          <Text style={styles.syncText}>Live Synced with SkillForge Web & Cloud</Text>
        </View>

        {/* Metric Cards Grid */}
        <Text style={styles.sectionTitle}>Overview Metrics</Text>
        <View style={styles.metricsGrid}>
          {/* Card 1: Total Goals */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(108, 99, 255, 0.15)' }]}>
              <Ionicons name="flag" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>
              {loading ? '-' : stats?.totalGoals ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Total Goals</Text>
          </View>

          {/* Card 2: Completed Goals */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(72, 187, 120, 0.15)' }]}>
              <Ionicons name="checkmark-done" size={20} color={Colors.success} />
            </View>
            <Text style={styles.metricValue}>
              {loading ? '-' : stats?.completedGoals ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>

          {/* Card 3: In Progress */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(62, 207, 207, 0.15)' }]}>
              <Ionicons name="trending-up" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.metricValue}>
              {loading ? '-' : stats?.inProgressGoals ?? 0}
            </Text>
            <Text style={styles.metricLabel}>In Progress</Text>
          </View>

          {/* Card 4: Overall Progress */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(236, 201, 75, 0.15)' }]}>
              <Ionicons name="speedometer" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.metricValue}>
              {loading ? '-' : `${stats?.overallProgress ?? 0}%`}
            </Text>
            <Text style={styles.metricLabel}>Completion</Text>
          </View>
        </View>

        {/* Quick Action: Ask AI Mentor */}
        <TouchableOpacity
          style={styles.aiActionCard}
          onPress={() => router.push('/(tabs)/ai-assistant')}
          activeOpacity={0.85}
        >
          <View style={styles.aiContent}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>SkillForge AI Mentor</Text>
              <Text style={styles.aiSubtitle}>
                Generate tailored study roadmaps & interview prep
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </View>
        </TouchableOpacity>

        {/* Recent Goals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Milestones</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" style={{ marginTop: 20 }} />
        ) : goals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="rocket-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Goals Set Yet</Text>
            <Text style={styles.emptySub}>Create your first goal to start tracking progress!</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/(tabs)/goals')}
            >
              <Text style={styles.createBtnText}>+ Create First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((item) => {
            const isDone = Boolean(item.isCompleted || item.completed || (item.progress != null && item.progress >= 100));
            const completedTasks = item.completedTaskCount != null ? item.completedTaskCount : 0;
            const totalTasks = item.taskCount != null ? item.taskCount : 0;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.goalCard}
                onPress={() => router.push(`/goal-detail/${item.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.goalHeaderRow}>
                  <Text style={styles.goalTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isDone
                          ? 'rgba(72, 187, 120, 0.2)'
                          : 'rgba(62, 207, 207, 0.2)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isDone ? Colors.success : Colors.secondary,
                        },
                      ]}
                    >
                      {isDone ? 'COMPLETED' : 'IN_PROGRESS'}
                    </Text>
                  </View>
                </View>

              <Text style={styles.goalDesc} numberOfLines={2}>
                {item.description || 'No description provided'}
              </Text>

              {totalTasks > 0 && (
                <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8, fontWeight: '600' }}>
                  🎯 {completedTasks} of {totalTasks} tasks completed
                </Text>
              )}

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(item.progress || 0, 100)}%`,
                        backgroundColor: isDone ? Colors.success : Colors.secondary,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.progressText,
                    { color: isDone ? Colors.success : Colors.secondary },
                  ]}
                >
                  {item.progress || 0}%
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  userName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(62, 207, 207, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 207, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
  },
  syncPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginRight: 8,
  },
  syncText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  aiActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.4)',
    padding: 16,
    marginTop: 8,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    width: 36,
    textAlign: 'right',
  },
});
