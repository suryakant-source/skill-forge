import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import axiosInstance from '../../api/axiosInstance';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Fetch Goal Detail
  const {
    data: goalData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['goal-detail', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/goals/${id}`);
      return res?.data || res;
    },
    enabled: !!id,
  });

  const goal = goalData?.data || goalData;

  // Add Task to Goal Mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskTitle) => {
      // Endpoint is /api/goals/{goalId}/tasks
      return await axiosInstance.post(`/goals/${id}/tasks`, {
        title: taskTitle,
        status: 'PENDING',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setNewTaskTitle('');
      setShowAddTask(false);
    },
    onError: (err) => {
      const msg = err.message || 'Failed to add task';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', msg);
      } else {
        alert(msg);
      }
    },
  });

  // Toggle Task Status Mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, currentStatus }) => {
      const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      return await axiosInstance.patch(`/tasks/${taskId}/status`, { status: nextStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTaskMutation.mutate(newTaskTitle.trim());
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading goal details...</Text>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.notFoundText}>Goal Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Goals</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const tasks = Array.isArray(goal.tasks) ? goal.tasks : [];
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Bar with Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Goal Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Goal Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    goal.status === 'COMPLETED'
                      ? 'rgba(72, 187, 120, 0.2)'
                      : 'rgba(108, 99, 255, 0.2)',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      goal.status === 'COMPLETED' ? Colors.success : Colors.primary,
                  },
                ]}
              >
                {goal.status || 'IN_PROGRESS'}
              </Text>
            </View>
            {goal.targetDate ? (
              <Text style={styles.targetDateText}>
                🎯 Target: {goal.targetDate}
              </Text>
            ) : null}
          </View>

          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.description ? (
            <Text style={styles.goalDesc}>{goal.description}</Text>
          ) : null}

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Milestone Completion</Text>
              <Text style={styles.progressValue}>{goal.progress || 0}%</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.min(goal.progress || 0, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.taskSummaryText}>
              {completedCount} of {tasks.length} tasks completed
            </Text>
          </View>
        </View>

        {/* Action Items / Subtasks Header */}
        <View style={styles.tasksHeader}>
          <View>
            <Text style={styles.sectionHeading}>Actionable Subtasks</Text>
            <Text style={styles.sectionSubtitle}>
              Check off items to advance goal progress
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addTaskTrigger}
            onPress={() => setShowAddTask(!showAddTask)}
          >
            <Ionicons
              name={showAddTask ? 'remove' : 'add'}
              size={20}
              color={Colors.secondary}
            />
            <Text style={styles.addTaskTriggerText}>
              {showAddTask ? 'Close' : 'Add Task'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inline Add Task Form */}
        {showAddTask && (
          <View style={styles.addTaskBox}>
            <TextInput
              style={styles.taskInput}
              placeholder="e.g. Read Chapter 3 or Build prototype"
              placeholderTextColor="#718096"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.addTaskBtn,
                addTaskMutation.isPending && { opacity: 0.6 },
              ]}
              onPress={handleAddTask}
              disabled={addTaskMutation.isPending}
            >
              {addTaskMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.addTaskBtnText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <View style={styles.emptyTasksBox}>
            <Ionicons name="list-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTasksText}>No tasks created yet</Text>
            <Text style={styles.emptyTasksSub}>
              Tap "Add Task" above to break this goal into actionable steps!
            </Text>
          </View>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() =>
                  toggleTaskMutation.mutate({
                    taskId: task.id,
                    currentStatus: task.status,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={[styles.taskCheckbox, isDone && styles.taskCheckboxChecked]}>
                  {isDone && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text
                  style={[styles.taskTitleText, isDone && styles.taskTitleTextDone]}
                >
                  {task.title}
                </Text>
              </TouchableOpacity>
            );
          })
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  targetDateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  goalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  goalDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 18,
  },
  progressSection: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.secondary,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  taskSummaryText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addTaskTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(62, 207, 207, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 207, 0.3)',
  },
  addTaskTriggerText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  addTaskBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  addTaskBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addTaskBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyTasksBox: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTasksText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyTasksSub: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskCheckboxChecked: {
    backgroundColor: Colors.secondary,
  },
  taskTitleText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  taskTitleTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  loadingText: {
    color: Colors.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  notFoundText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
