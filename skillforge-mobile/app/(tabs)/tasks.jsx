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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import axiosInstance from '../../api/axiosInstance';

export default function TasksScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED

  // Fetch Tasks
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
        const goals = Array.isArray(goalsRes) ? goalsRes : (Array.isArray(goalsRes?.data) ? goalsRes.data : []);
        const tasksPromises = goals.map(async (g) => {
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

  // Toggle Task Status Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, currentStatus }) => {
      const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      return await axiosInstance.patch(`/tasks/${taskId}/status`, { status: nextStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return t.status !== 'COMPLETED';
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
          <Text style={styles.title}>Execution Tasks</Text>
          <Text style={styles.subtitle}>Daily action items linked to your career goals</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {['ALL', 'PENDING', 'COMPLETED'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}
              >
                {f === 'ALL' ? 'All Tasks' : f === 'PENDING' ? 'Pending' : 'Completed'}
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
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySub}>
              Open a goal to generate or add specific execution tasks!
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
              return (
                <View style={styles.taskCard}>
                  <TouchableOpacity
                    style={[styles.checkbox, isDone && styles.checkboxChecked]}
                    onPress={() =>
                      toggleMutation.mutate({
                        taskId: item.id,
                        currentStatus: item.status,
                      })
                    }
                  >
                    {isDone && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <View style={styles.taskInfo}>
                    <Text
                      style={[styles.taskTitle, isDone && styles.taskTitleDone]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    {item.goalTitle ? (
                      <Text style={styles.goalTag} numberOfLines={1}>
                        🎯 {item.goalTitle}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: `${getStatusColor(item.status)}20` },
                    ]}
                  >
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
              );
            }}
          />
        )}
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
    marginBottom: 20,
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
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.secondary,
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  goalTag: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
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
    maxWidth: 260,
  },
});
