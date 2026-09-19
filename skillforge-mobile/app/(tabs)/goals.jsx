/**
 * goals.jsx - SkillForge Mobile Goals Feed Screen
 *
 * Features:
 *  - Search filter (real-time by title)
 *  - Horizontal Category Chips (All, Backend, Frontend, ...)
 *  - FlatList of GoalCards with pull-to-refresh
 *  - GoalFormModal for Create & Edit
 *  - Delete with Alert confirmation
 *  - Floating Action Button (FAB)
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../../hooks/useGoals';
import GoalCard from '../../components/goals/GoalCard';
import GoalFormModal from '../../components/goals/GoalFormModal';

// ── Category filter options ──────────────────────────────────────────────────
const CATEGORY_CHIPS = ['All', 'BACKEND', 'FRONTEND', 'MOBILE', 'DATABASE', 'DEVOPS', 'AI_ML', 'DESIGN', 'OTHER'];

export default function GoalsScreen() {
  const router = useRouter();

  // ── State ──
  const [search, setSearch]                 = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalVisible, setModalVisible]     = useState(false);
  const [editingGoal, setEditingGoal]       = useState(null); // null = create, obj = edit

  // ── Data ──
  const { data: goals = [], isLoading, isRefetching, refetch } = useGoals();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  // ── Filtered goals ──
  const filteredGoals = useMemo(() => {
    let list = [...goals];
    if (activeCategory !== 'All') {
      list = list.filter((g) => g.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.title?.toLowerCase().includes(q));
    }
    return list;
  }, [goals, activeCategory, search]);

  // ── Handlers ──
  const openCreate = () => { setEditingGoal(null); setModalVisible(true); };
  const openEdit   = (goal) => { setEditingGoal(goal); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setEditingGoal(null); };

  const handleSubmit = (formData) => {
    if (editingGoal) {
      updateMutation.mutate(
        { id: editingGoal.id, data: formData },
        { onSuccess: closeModal }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: closeModal });
    }
  };

  const handleDelete = (goal) => {
    Alert.alert(
      'Delete Goal',
      `Delete "${goal.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => deleteMutation.mutate(goal.id),
        },
      ]
    );
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ── Empty state ──
  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flag-outline" size={52} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>
        {search || activeCategory !== 'All' ? 'No matching goals' : 'No Goals Yet'}
      </Text>
      <Text style={styles.emptySub}>
        {search || activeCategory !== 'All'
          ? 'Try a different search or category'
          : 'Create your first learning goal to get started!'}
      </Text>
      {!search && activeCategory === 'All' && (
        <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
          <Text style={styles.emptyBtnText}>+ Create First Goal</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Learning Goals</Text>
          <Text style={styles.headerSub}>Track & conquer your milestones</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={openCreate}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search goals by keyword..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Category Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORY_CHIPS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
              {cat === 'All' ? '🌐 All' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Goals FlatList ── */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filteredGoals}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <GoalCard
              goal={item}
              onPress={() => router.push(`/goal-detail/${item.id}`)}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={<ListEmpty />}
        />
      )}

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ── Create / Edit Modal ── */}
      <GoalFormModal
        visible={modalVisible}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingGoal}
        isLoading={isMutating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
  },
  newBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, marginHorizontal: 20, marginBottom: 12,
    paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1, color: Colors.text, fontSize: 14,
    paddingVertical: 12,
  },

  // Category chips
  chipsScroll: { maxHeight: 46, marginBottom: 4 },
  chipsContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },

  // FlatList
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },

  // Empty
  emptyContainer: {
    alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30,
  },
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

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
