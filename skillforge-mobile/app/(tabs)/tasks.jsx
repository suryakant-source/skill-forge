import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import axiosInstance from '../../api/axiosInstance';

export default function TasksScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, COMPLETED
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Fetch Goals
  const { data: goals = [] } = useQuery({
    queryKey: ['goals-list'],
    queryFn: async () => {
      const res = await axiosInstance.get('/goals');
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
  });

  // Fetch Tasks across all goals
  const {
    data: tasks = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: async () => {
      try {
        const goalsRes = await axiosInstance.get('/goals');
        const goalsList = Array.isArray(goalsRes) ? goalsRes : (Array.isArray(goalsRes?.data) ? goalsRes.data : []);
        const tasksPromises = goalsList.map(async (g) => {
          try {
            const tRes = await axiosInstance.get(`/goals/${g.id}/tasks`);
            const tList = Array.isArray(tRes) ? tRes : (Array.isArray(tRes?.data) ? tRes.data : []);
            return tList.map((t) => ({ ...t, goalTitle: g.title, goalId: g.id }));
          } catch {
            return [];
          }
        });
        const results = await Promise.all(tasksPromises);
        return results.flat();
      } catch (err) {
        console.error('[Tasks] Error fetching tasks:', err);
        return [];
      }
    },
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      return await axiosInstance.patch(`/tasks/${taskId}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-goals'] });
    },
    onError: (err) => {
      const msg = err.message || 'Failed to update task status';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', msg);
      } else {
        alert(msg);
      }
    },
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({ goalId, title }) => {
      return await axiosInstance.post(`/goals/${goalId}/tasks`, {
        title,
        status: 'PENDING',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setAddTaskModalVisible(false);
      setNewTaskTitle('');
    },
    onError: (err) => {
      const msg = err.message || 'Failed to create task';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', msg);
      } else {
        alert(msg);
      }
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      return await axiosInstance.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      alert('Please enter a task title');
      return;
    }
    const targetGoalId = selectedGoalId || goals[0]?.id;
    if (!targetGoalId) {
      alert('Please create a goal first before adding tasks');
      return;
    }
    createTaskMutation.mutate({ goalId: targetGoalId, title: newTaskTitle.trim() });
  };

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return t.status === 'PENDING';
    if (filter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return Colors.success;
      case 'IN_PROGRESS':
        return Colors.secondary;
      default:
        return Colors.warning;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Execution Tasks</Text>
            <Text style={styles.subtitle}>Actionable steps linked to your learning goals</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              if (goals.length > 0 && !selectedGoalId) {
                setSelectedGoalId(goals[0].id);
              }
              setAddTaskModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Pills with Counts */}
        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: 'All', count: tasks.length },
            { id: 'PENDING', label: 'Pending', count: pendingCount },
            { id: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount },
            { id: 'COMPLETED', label: 'Completed', count: completedCount },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterPill, filter === f.id && styles.filterPillActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text
                style={[styles.filterPillText, filter === f.id && styles.filterPillTextActive]}
                numberOfLines={1}
              >
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No tasks in this stage</Text>
            <Text style={styles.emptySub}>
              {filter === 'COMPLETED'
                ? 'Check off tasks or tap "Complete" to mark them done!'
                : 'Tap the "+" button above to add an actionable task!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => String(item.id)}
            refreshing={isRefetching}
            onRefresh={refetch}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => {
              const isDone = item.status === 'COMPLETED';
              const isInProgress = item.status === 'IN_PROGRESS';
              const isPending = item.status === 'PENDING' || !item.status;

              return (
                <View
                  style={[
                    styles.taskCard,
                    isDone && styles.taskCardCompleted,
                    isInProgress && styles.taskCardInProgress,
                  ]}
                >
                  {/* Top: Goal Tag & Status Badge */}
                  <View style={styles.taskCardHeader}>
                    {item.goalTitle ? (
                      <View style={styles.goalBadge}>
                        <Text style={styles.goalBadgeText} numberOfLines={1}>
                          🎯 {item.goalTitle}
                        </Text>
                      </View>
                    ) : <View />}

                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: `${getStatusColor(item.status)}20` },
                      ]}
                    >
                      <Ionicons
                        name={
                          isDone
                            ? 'checkmark-circle'
                            : isInProgress
                            ? 'play-circle'
                            : 'time-outline'
                        }
                        size={12}
                        color={getStatusColor(item.status)}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {item.status || 'PENDING'}
                      </Text>
                    </View>
                  </View>

                  {/* Middle: Checkbox + Title */}
                  <View style={styles.taskCardBody}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        isDone && styles.checkboxCompleted,
                        isInProgress && styles.checkboxInProgress,
                      ]}
                      onPress={() =>
                        statusMutation.mutate({
                          taskId: item.id,
                          newStatus: isDone ? 'PENDING' : 'COMPLETED',
                        })
                      }
                      activeOpacity={0.7}
                    >
                      {isDone && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                      {isInProgress && <Ionicons name="play" size={12} color={Colors.secondary} />}
                    </TouchableOpacity>

                    <View style={styles.taskInfo}>
                      <Text
                        style={[
                          styles.taskTitle,
                          isDone && styles.taskTitleDone,
                          isInProgress && styles.taskTitleInProgress,
                        ]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text style={styles.taskDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Bottom: Quick Status Transition Buttons */}
                  <View style={styles.taskCardActions}>
                    <View style={styles.statusButtonsRow}>
                      {!isPending && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.pendingActionBtn]}
                          onPress={() =>
                            statusMutation.mutate({ taskId: item.id, newStatus: 'PENDING' })
                          }
                        >
                          <Text style={styles.pendingActionText}>Pending</Text>
                        </TouchableOpacity>
                      )}
                      {!isInProgress && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.inProgressActionBtn]}
                          onPress={() =>
                            statusMutation.mutate({ taskId: item.id, newStatus: 'IN_PROGRESS' })
                          }
                        >
                          <Text style={styles.inProgressActionText}>In Progress</Text>
                        </TouchableOpacity>
                      )}
                      {!isDone && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.completeActionBtn]}
                          onPress={() =>
                            statusMutation.mutate({ taskId: item.id, newStatus: 'COMPLETED' })
                          }
                        >
                          <Text style={styles.completeActionText}>Complete ✓</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => {
                        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => deleteTaskMutation.mutate(item.id),
                          },
                        ]);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Add Task Modal */}
        <Modal
          visible={addTaskModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddTaskModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Execution Task</Text>
                <TouchableOpacity onPress={() => setAddTaskModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {goals.length > 0 ? (
                <>
                  <Text style={styles.inputLabel}>Assign to Goal *</Text>
                  <View style={styles.goalPickerContainer}>
                    {goals.map((g) => (
                      <TouchableOpacity
                        key={g.id}
                        style={[
                          styles.goalOptionChip,
                          (selectedGoalId === g.id || (!selectedGoalId && goals[0]?.id === g.id)) &&
                            styles.goalOptionChipActive,
                        ]}
                        onPress={() => setSelectedGoalId(g.id)}
                      >
                        <Text
                          style={[
                            styles.goalOptionChipText,
                            (selectedGoalId === g.id || (!selectedGoalId && goals[0]?.id === g.id)) &&
                              styles.goalOptionChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {g.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.noGoalsWarn}>
                  ⚠️ No goals found. Please create a learning goal first!
                </Text>
              )}

              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Read Chapter 2 & build prototype"
                placeholderTextColor="#718096"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  createTaskMutation.isPending && { opacity: 0.6 },
                ]}
                onPress={handleCreateTask}
                disabled={createTaskMutation.isPending || goals.length === 0}
              >
                {createTaskMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: Colors.surfaceLight,
  },
  filterPillText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskCardCompleted: {
    borderColor: 'rgba(72, 187, 120, 0.35)',
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
  },
  taskCardInProgress: {
    borderColor: 'rgba(62, 207, 207, 0.4)',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
    maxWidth: '65%',
  },
  goalBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkboxInProgress: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(62, 207, 207, 0.1)',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskTitleInProgress: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taskDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
  },
  taskCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingActionBtn: {
    backgroundColor: 'rgba(236, 201, 75, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(236, 201, 75, 0.3)',
  },
  pendingActionText: {
    color: '#ECC94B',
    fontSize: 11,
    fontWeight: '700',
  },
  inProgressActionBtn: {
    backgroundColor: 'rgba(62, 207, 207, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 207, 0.3)',
  },
  inProgressActionText: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  completeActionBtn: {
    backgroundColor: 'rgba(72, 187, 120, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(72, 187, 120, 0.3)',
  },
  completeActionText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  goalPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  goalOptionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalOptionChipActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.25)',
    borderColor: Colors.primary,
  },
  goalOptionChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  goalOptionChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  noGoalsWarn: {
    color: Colors.warning,
    fontSize: 13,
    marginVertical: 10,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

