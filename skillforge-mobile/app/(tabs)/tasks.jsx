/**
 * tasks.jsx - SkillForge Mobile Tasks Management Screen
 *
 * Features:
 *  - Goal selector chips (horizontal scroll filter)
 *  - Status tabs: All / Pending / In Progress / Completed  (with count badges)
 *  - Interactive TaskCard list with 1-tap checkbox
 *  - TaskFormModal for create & edit
 *  - Real-time goal progress sync via query invalidation
 *  - Pull-to-refresh
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useGoals } from '../../hooks/useGoals';
import TaskCard from '../../components/tasks/TaskCard';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import taskApi from '../../api/taskApi';

const STATUS_TABS = [
  { key: 'ALL',         label: 'All' },
  { key: 'PENDING',     label: '⏳ Pending' },
  { key: 'IN_PROGRESS', label: '🔄 Active' },
  { key: 'COMPLETED',   label: '✅ Done' },
];

export default function TasksScreen() {
  const queryClient = useQueryClient();

  // ── Filter state ──
  const [selectedGoalId, setSelectedGoalId] = useState(null); // null = All Goals
  const [statusFilter, setStatusFilter]     = useState('ALL');

  // ── Modal state ──
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask]   = useState(null); // null = create mode
  const [isSaving, setIsSaving]         = useState(false);

  // ── Goals (for horizontal chips) ──
  const { data: goals = [] } = useGoals();

  // ── Tasks query ──
  const {
    data: tasks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: selectedGoalId ? ['tasks', selectedGoalId] : ['all-tasks', goals.map((g) => g.id).join(',')],
    queryFn: async () => {
      if (selectedGoalId) {
        const ts = await taskApi.getTasksByGoal(selectedGoalId);
        const goal = goals.find((g) => g.id === selectedGoalId);
        return ts.map((t) => ({ ...t, goalTitle: goal?.title, goalId: selectedGoalId }));
      }
      // All goals — fetch concurrently then flatten
      const results = await Promise.all(
        goals.map((g) =>
          taskApi
            .getTasksByGoal(g.id)
            .then((ts) => ts.map((t) => ({ ...t, goalTitle: g.title, goalId: g.id })))
            .catch(() => [])
        )
      );
      return results.flat();
    },
    enabled: selectedGoalId ? true : goals.length > 0,
  });

  // ── Invalidation helper ──
  const invalidate = (goalId) => {
    if (goalId) queryClient.invalidateQueries({ queryKey: ['tasks', goalId] });
    queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['goals'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-goals'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
  };

  // ── Filtered tasks ──
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'ALL') return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  // ── Tab counts ──
  const counts = useMemo(() => ({
    ALL:         tasks.length,
    PENDING:     tasks.filter((t) => t.status === 'PENDING').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED:   tasks.filter((t) => t.status === 'COMPLETED').length,
  }), [tasks]);

  // ── Modal handlers ──
  const openCreate = () => { setEditingTask(null); setModalVisible(true); };
  const openEdit   = (task) => { setEditingTask(task); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setEditingTask(null); };

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, formData);
        invalidate(editingTask.goalId || selectedGoalId);
        closeModal();
      } else {
        const goalId = selectedGoalId || goals[0]?.id;
        if (!goalId) {
          Alert.alert('Select a Goal', 'Please select a goal chip above to add a task.');
          return;
        }
        await taskApi.createTask(goalId, formData);
        invalidate(goalId);
        Alert.alert('Success', 'Task added! 📋');
        closeModal();
      }
    } catch {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Checkbox toggle ──
  const handleToggle = async (taskId, nextStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    const gId  = task?.goalId || selectedGoalId;
    try {
      await taskApi.updateTaskStatus(taskId, nextStatus);
      invalidate(gId);
    } catch {
      Alert.alert('Error', 'Could not update status');
    }
  };

  // ── Delete ──
  const handleDelete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    Alert.alert('Delete Task', `Delete "${task?.title || 'this task'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await taskApi.deleteTask(taskId);
            invalidate(task?.goalId || selectedGoalId);
          } catch {
            Alert.alert('Error', 'Could not delete task');
          }
        },
      },
    ]);
  };

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  const ListEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="checkmark-circle-outline" size={52} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>No Tasks Found</Text>
      <Text style={styles.emptySub}>
        {selectedGoalId
          ? 'Add tasks to this goal to start tracking progress.'
          : 'Select a goal chip above, then add your first task!'}
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
        <Text style={styles.emptyBtnText}>+ Add Task</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.headerSub}>Checklist to conquer your goals</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* ── Goal Selector Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedGoalId && styles.chipActive]}
          onPress={() => setSelectedGoalId(null)}
        >
          <Text style={[styles.chipText, !selectedGoalId && styles.chipTextActive]}>
            🌐 All Goals
          </Text>
        </TouchableOpacity>

        {goals.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.chip, selectedGoalId === g.id && styles.chipActive]}
            onPress={() => setSelectedGoalId(g.id)}
          >
            <Text
              style={[styles.chipText, selectedGoalId === g.id && styles.chipTextActive]}
              numberOfLines={1}
            >
              {g.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Status Filter Tabs ── */}
      <View style={styles.tabsRow}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, statusFilter === tab.key && styles.tabActive]}
            onPress={() => setStatusFilter(tab.key)}
          >
            <Text style={[styles.tabText, statusFilter === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {counts[tab.key] > 0 && (
              <View style={[styles.countBadge, statusFilter === tab.key && styles.countBadgeActive]}>
                <Text style={[styles.countBadgeText, statusFilter === tab.key && styles.countBadgeTextActive]}>
                  {counts[tab.key]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tasks List ── */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggleStatus={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={<ListEmpty />}
        />
      )}

      {/* ── Task Form Modal ── */}
      <TaskFormModal
        visible={modalVisible}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingTask}
        isLoading={isSaving}
        goalTitle={selectedGoal?.title || editingTask?.goalTitle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // Goal chips
  chipsScroll: { maxHeight: 48, marginBottom: 4 },
  chipsContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.surface,
    maxWidth: 160,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },

  // Status tabs
  tabsRow: {
    flexDirection: 'row', paddingHorizontal: 20,
    gap: 6, marginVertical: 10,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4,
    paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  countBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
  },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  countBadgeText: { color: Colors.textMuted, fontSize: 10, fontWeight: '700' },
  countBadgeTextActive: { color: '#FFF' },

  // FlatList
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },

  // Empty state
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyTitle: {
    color: Colors.text, fontSize: 18, fontWeight: '700',
    marginTop: 16, marginBottom: 8,
  },
  emptySub: {
    color: Colors.textMuted, fontSize: 14,
    textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
