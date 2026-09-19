import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import axiosInstance from '../../api/axiosInstance';

export default function GoalsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, IN_PROGRESS, COMPLETED
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('BACKEND');
  const [newTargetDays, setNewTargetDays] = useState('30');
  const [newDailyHours, setNewDailyHours] = useState('2');

  const CATEGORIES = ['BACKEND', 'FRONTEND', 'MOBILE', 'AI_ML', 'DATABASE', 'DEVOPS', 'DESIGN', 'OTHER'];

  // Fetch Goals List
  const {
    data: goals = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['goals-list'],
    queryFn: async () => {
      const res = await axiosInstance.get('/goals');
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
  });

  // Create Goal Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.post('/goals', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-goals'] });
      setModalVisible(false);
      setNewTitle('');
      setNewDescription('');
      setNewCategory('BACKEND');
      setNewTargetDays('30');
      setNewDailyHours('2');
    },
    onError: (err) => {
      const msg = err.message || 'Failed to create goal';
      if (Platform.OS !== 'web') {
        Alert.alert('Error', msg);
      } else {
        alert(msg);
      }
    },
  });

  // Delete Goal Mutation
  const deleteMutation = useMutation({
    mutationFn: async (goalId) => {
      return await axiosInstance.delete(`/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleCreate = () => {
    if (!newTitle.trim()) {
      alert('Please enter a goal title');
      return;
    }

    const days = parseInt(newTargetDays, 10);
    const hours = parseInt(newDailyHours, 10);

    createMutation.mutate({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory || 'BACKEND',
      targetDays: isNaN(days) ? 30 : Math.max(1, Math.min(days, 365)),
      dailyHours: isNaN(hours) ? 2 : Math.max(1, Math.min(hours, 24)),
    });
  };

  const isGoalCompleted = (g) => Boolean(g.isCompleted || g.completed || (g.progress != null && g.progress >= 100));

  const completedGoalsCount = goals.filter(isGoalCompleted).length;
  const inProgressGoalsCount = goals.filter((g) => !isGoalCompleted(g)).length;

  const filteredGoals = goals.filter((g) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'COMPLETED') return isGoalCompleted(g);
    if (activeFilter === 'IN_PROGRESS') return !isGoalCompleted(g);
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Learning Goals</Text>
            <Text style={styles.subtitle}>Define outcomes and conquer milestones</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs with Counts */}
        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: 'All Goals', count: goals.length },
            { id: 'IN_PROGRESS', label: 'In Progress', count: inProgressGoalsCount },
            { id: 'COMPLETED', label: 'Completed', count: completedGoalsCount },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterTab,
                activeFilter === tab.id && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === tab.id && styles.filterTextActive,
                ]}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filteredGoals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No goals found in this category</Text>
            <Text style={styles.emptySub}>
              {activeFilter === 'COMPLETED'
                ? 'Complete all subtasks of a goal to finish it!'
                : 'Create a new learning goal to start your journey!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredGoals}
            keyExtractor={(item) => String(item.id)}
            refreshing={isRefetching}
            onRefresh={refetch}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => {
              const isDone = isGoalCompleted(item);
              const completedTasks = item.completedTaskCount != null ? item.completedTaskCount : 0;
              const totalTasks = item.taskCount != null ? item.taskCount : 0;

              return (
                <TouchableOpacity
                  style={[styles.goalCard, isDone && styles.goalCardCompleted]}
                  onPress={() => router.push(`/goal-detail/${item.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardHeaderLeft}>
                      {item.category ? (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{item.category}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.goalTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isDone
                            ? 'rgba(72, 187, 120, 0.2)'
                            : 'rgba(62, 207, 207, 0.2)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: isDone ? Colors.success : Colors.secondary,
                          },
                        ]}
                      >
                        {isDone ? 'COMPLETED' : 'IN_PROGRESS'}
                      </Text>
                    </View>
                  </View>

                  {item.description ? (
                    <Text style={styles.goalDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  {/* Task Completion Summary */}
                  <View style={styles.taskCountRow}>
                    <Ionicons
                      name={isDone ? 'checkmark-done-circle' : 'checkbox-outline'}
                      size={14}
                      color={isDone ? Colors.success : Colors.secondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.taskCountText}>
                      {totalTasks > 0
                        ? `${completedTasks} of ${totalTasks} tasks completed`
                        : 'No tasks yet - tap to add'}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(item.progress || 0, 100)}%`,
                            backgroundColor: isDone ? Colors.success : Colors.secondary,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.progressVal,
                        { color: isDone ? Colors.success : Colors.secondary },
                      ]}
                    >
                      {item.progress || 0}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Create Goal Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Learning Goal</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Goal Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Master Microservices Architecture"
                placeholderTextColor="#718096"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      newCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        newCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Key concepts, frameworks, and milestones..."
                placeholderTextColor="#718096"
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
              />

              <View style={styles.inlineInputsRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Target Days (1-365) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="30"
                    placeholderTextColor="#718096"
                    value={newTargetDays}
                    onChangeText={setNewTargetDays}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Daily Hours (1-24) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="2"
                    placeholderTextColor="#718096"
                    value={newDailyHours}
                    onChangeText={setNewDailyHours}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, createMutation.isPending && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Create Goal</Text>
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
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.surfaceLight,
  },
  filterText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardCompleted: {
    borderColor: 'rgba(72, 187, 120, 0.35)',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    marginBottom: 4,
  },
  categoryBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  taskCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskCountText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  progressVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 12,
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
    marginBottom: 20,
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
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.25)',
    borderColor: Colors.primary,
  },
  categoryChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inlineInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
