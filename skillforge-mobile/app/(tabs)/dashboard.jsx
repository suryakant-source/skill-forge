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

// ─── Helper ────────────────────────────────────────────────────────────────
const isGoalDone = (g) =>
  Boolean(g.isCompleted || g.completed || (g.progress != null && g.progress >= 100));

// ─── Main Component ─────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // ── Goals Data ──
  const {
    data: goals = [],
    isLoading: goalsLoading,
    refetch: refetchGoals,
    isRefetching: goalsRefetching,
  } = useQuery({
    queryKey: ['dashboard-goals'],
    queryFn: async () => {
      const res = await axiosInstance.get('/goals');
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    },
  });

  // ── Tasks Data (aggregated from all goals) ──
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
    isRefetching: tasksRefetching,
  } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      const goalsRes = await axiosInstance.get('/goals');
      const list = Array.isArray(goalsRes) ? goalsRes : (Array.isArray(goalsRes?.data) ? goalsRes.data : []);
      const settled = await Promise.allSettled(
        list.map((g) =>
          axiosInstance.get(`/goals/${g.id}/tasks`).then((r) => {
            const t = Array.isArray(r) ? r : (Array.isArray(r?.data) ? r.data : []);
            return t.map((task) => ({ ...task, goalTitle: g.title, goalId: g.id }));
          })
        )
      );
      return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    },
  });

  const loading = goalsLoading || tasksLoading;
  const isRefreshing = goalsRefetching || tasksRefetching;

  const onRefresh = () => {
    refetchGoals();
    refetchTasks();
  };

  // ── Derived Stats ──
  const totalGoals = goals.length;
  const completedGoals = goals.filter(isGoalDone).length;
  const inProgressGoals = totalGoals - completedGoals;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED' || t.completed).length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || (!t.status && !t.completed)).length;

  // Recent 3 goals for preview
  const recentGoals = goals.slice(0, 3);

  // ── UI ──
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.secondary]}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeLabel}>Welcome back,</Text>
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

        {/* ── Live Sync Badge ── */}
        <View style={styles.syncBadge}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>🔄 Live Synced · SkillForge Cloud</Text>
        </View>

        {/* ── Hero Progress Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Overall Progress</Text>
            <Text style={styles.heroSubtitle}>
              {completedGoals} of {totalGoals} goals achieved
            </Text>
            {/* Progress Bar */}
            <View style={styles.heroBarTrack}>
              <View
                style={[
                  styles.heroBarFill,
                  { width: loading ? '0%' : `${overallProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.heroPercent}>{loading ? '—' : `${overallProgress}% complete`}</Text>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroBadge}>
              <Ionicons name="trophy" size={28} color={Colors.warning} />
              <Text style={styles.heroBadgeValue}>{loading ? '-' : completedGoals}</Text>
              <Text style={styles.heroBadgeLabel}>Won</Text>
            </View>
          </View>
        </View>

        {/* ── Goals Stats Grid ── */}
        <Text style={styles.sectionTitle}>📌 Goal Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="flag"
            iconBg="rgba(108, 99, 255, 0.15)"
            iconColor={Colors.primary}
            label="Total Goals"
            value={loading ? '—' : totalGoals}
          />
          <StatCard
            icon="checkmark-done-circle"
            iconBg="rgba(72, 187, 120, 0.15)"
            iconColor={Colors.success}
            label="Completed"
            value={loading ? '—' : completedGoals}
          />
          <StatCard
            icon="trending-up"
            iconBg="rgba(62, 207, 207, 0.15)"
            iconColor={Colors.secondary}
            label="In Progress"
            value={loading ? '—' : inProgressGoals}
          />
          <StatCard
            icon="speedometer"
            iconBg="rgba(236, 201, 75, 0.15)"
            iconColor={Colors.warning}
            label="Completion"
            value={loading ? '—' : `${overallProgress}%`}
          />
        </View>

        {/* ── Task Stats Row ── */}
        <Text style={styles.sectionTitle}>✅ Task Metrics</Text>
        <View style={styles.taskStatsRow}>
          <TaskStatPill
            label="Pending"
            value={loading ? '-' : pendingTasks}
            color={Colors.warning}
            bg="rgba(236, 201, 75, 0.12)"
            icon="time-outline"
          />
          <TaskStatPill
            label="In Progress"
            value={loading ? '-' : inProgressTasks}
            color={Colors.secondary}
            bg="rgba(62, 207, 207, 0.12)"
            icon="reload-circle-outline"
          />
          <TaskStatPill
            label="Done"
            value={loading ? '-' : completedTasks}
            color={Colors.success}
            bg="rgba(72, 187, 120, 0.12)"
            icon="checkmark-circle-outline"
          />
          <TaskStatPill
            label="Total"
            value={loading ? '-' : totalTasks}
            color={Colors.primary}
            bg="rgba(108, 99, 255, 0.12)"
            icon="layers-outline"
          />
        </View>

        {/* ── AI Mentor CTA ── */}
        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => router.push('/(tabs)/ai-assistant')}
          activeOpacity={0.85}
        >
          <View style={styles.aiIconBadge}>
            <Ionicons name="sparkles" size={22} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>SkillForge AI Mentor</Text>
            <Text style={styles.aiSub}>Generate tailored roadmaps &amp; interview prep</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
        </TouchableOpacity>

        {/* ── Quick Actions ── */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(tabs)/goals')}
          >
            <Ionicons name="add-circle" size={18} color={Colors.primary} />
            <Text style={styles.quickBtnText}>New Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            <Ionicons name="list-circle" size={18} color={Colors.secondary} />
            <Text style={styles.quickBtnText}>All Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person-circle" size={18} color={Colors.warning} />
            <Text style={styles.quickBtnText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Active Milestones ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚀 Active Milestones</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" style={{ marginTop: 20 }} />
        ) : recentGoals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="rocket-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Goals Yet</Text>
            <Text style={styles.emptySub}>Create your first goal to start tracking!</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(tabs)/goals')}
            >
              <Text style={styles.emptyBtnText}>+ Create First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentGoals.map((item) => {
            const done = isGoalDone(item);
            const tasksDone = item.completedTaskCount ?? 0;
            const tasksTotal = item.taskCount ?? 0;
            const pct = Math.min(item.progress || 0, 100);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.goalCard}
                onPress={() => router.push(`/goal-detail/${item.id}`)}
                activeOpacity={0.8}
              >
                {/* Title + Badge */}
                <View style={styles.goalRow}>
                  <Text style={styles.goalTitle} numberOfLines={1}>{item.title}</Text>
                  <View
                    style={[
                      styles.goalBadge,
                      { backgroundColor: done ? 'rgba(72,187,120,0.18)' : 'rgba(62,207,207,0.18)' },
                    ]}
                  >
                    <Text style={[styles.goalBadgeText, { color: done ? Colors.success : Colors.secondary }]}>
                      {done ? '✓ DONE' : 'ACTIVE'}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.goalDesc} numberOfLines={2}>
                  {item.description || 'No description provided'}
                </Text>

                {/* Task Count */}
                {tasksTotal > 0 && (
                  <Text style={styles.taskCount}>
                    🎯 {tasksDone}/{tasksTotal} tasks completed
                  </Text>
                )}

                {/* Progress Bar */}
                <View style={styles.progressRow}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: done ? Colors.success : Colors.secondary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.pctText, { color: done ? Colors.success : Colors.secondary }]}>
                    {pct}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Mini Components ────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <View style={sc.card}>
      <View style={[sc.iconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

function TaskStatPill({ icon, label, value, color, bg }) {
  return (
    <View style={[tp.pill, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[tp.value, { color }]}>{value}</Text>
      <Text style={tp.label}>{label}</Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20, paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  welcomeLabel: { color: Colors.textMuted, fontSize: 13 },
  userName: { color: Colors.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // Sync
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(62,207,207,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(62,207,207,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginBottom: 20,
  },
  syncDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.secondary, marginRight: 8,
  },
  syncText: { color: Colors.secondary, fontSize: 12, fontWeight: '600' },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLeft: { flex: 1 },
  heroTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  heroSubtitle: { color: Colors.textMuted, fontSize: 12, marginBottom: 14 },
  heroBarTrack: {
    height: 8, backgroundColor: Colors.surfaceLight,
    borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  heroBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  heroPercent: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  heroRight: { marginLeft: 16 },
  heroBadge: { alignItems: 'center', gap: 4 },
  heroBadgeValue: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  heroBadgeLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },

  // Section
  sectionTitle: {
    color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
  },
  viewAll: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  // Stats grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 12, marginBottom: 24,
  },

  // Tasks row
  taskStatsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 20,
  },

  // AI Card
  aiCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.4)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIconBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  aiTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  aiSub: { color: Colors.textMuted, fontSize: 12 },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 24,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
  },
  quickBtnText: { color: Colors.text, fontSize: 12, fontWeight: '600' },

  // Goal Cards
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitle: {
    color: Colors.text, fontSize: 15, fontWeight: '700',
    flex: 1, marginRight: 10,
  },
  goalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  goalBadgeText: { fontSize: 10, fontWeight: '700' },
  goalDesc: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 10 },
  taskCount: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  barTrack: {
    flex: 1, height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3, overflow: 'hidden', marginRight: 10,
  },
  barFill: { height: '100%', borderRadius: 3 },
  pctText: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },

  // Empty state
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 28, borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  emptySub: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 18 },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});

// StatCard styles
const sc = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  value: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  label: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
});

// TaskStatPill styles
const tp = StyleSheet.create({
  pill: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 14, gap: 4,
  },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
});

