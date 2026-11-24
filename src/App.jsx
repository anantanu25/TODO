import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import DeleteModal from './components/DeleteModal';
import SupabaseModal from './components/SupabaseModal';
import Toast from './components/Toast';
import { taskService } from './services/taskService';
import { isUsingSupabase, initSupabaseClient } from './lib/supabase';

export default function App() {
  // Task state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [sortBy, setSortBy] = useState('created_desc'); // 'created_desc' | 'created_asc' | 'due_asc' | 'due_desc' | 'priority_desc'

  // Metric stats
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    completionRate: 0,
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Connection indicator
  const [isSupabase, setIsSupabase] = useState(isUsingSupabase);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch metrics
  const refreshMetrics = useCallback(async () => {
    try {
      const stats = await taskService.getMetrics();
      setMetrics(stats);
    } catch (err) {
      console.error('Failed to compute metrics:', err);
    }
  }, []);

  // Fetch tasks
  const loadTasks = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const data = await taskService.fetchTasks({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        sortBy: sortBy,
      });
      setTasks(data);
      await refreshMetrics();
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      showToast('Could not load tasks: ' + err.message, 'error');
    } finally {
      if (showLoadingSpinner) setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, sortBy, refreshMetrics, showToast]);

  // Initial load and whenever filters change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTasks(false);
    showToast('Task list refreshed', 'info');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('created_desc');
  };

  // ----------------------------------------------------
  // CRUD Operation Handlers
  // ----------------------------------------------------

  // CREATE or UPDATE task
  const handleSaveTask = async (taskData) => {
    if (taskToEdit) {
      // UPDATE operation
      const updated = await taskService.updateTask(taskToEdit.id, taskData);
      setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? updated : t)));
      showToast('Task updated successfully!', 'success');
    } else {
      // CREATE operation
      const created = await taskService.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      showToast('New task added successfully!', 'success');
    }
    await refreshMetrics();
    // Reload full list in case current filters/sort require reordering
    loadTasks(false);
  };

  // UPDATE: Toggle task status (Pending / Completed)
  const handleToggleStatus = async (taskId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';

      // Optimistic UI update for instantaneous responsiveness
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );

      await taskService.toggleTaskStatus(taskId, currentStatus);
      await refreshMetrics();

      showToast(
        nextStatus === 'completed' ? 'Task marked as completed! 🎉' : 'Task moved to pending',
        'info'
      );

      // If viewing filtered status (e.g. only Pending), reload list
      if (statusFilter !== 'all') {
        loadTasks(false);
      }
    } catch (err) {
      showToast('Failed to toggle status: ' + err.message, 'error');
      loadTasks(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Open New Task Modal
  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // DELETE operation
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(taskToDelete.id);

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      showToast(`Task "${taskToDelete.title}" deleted`, 'info');

      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      await refreshMetrics();
    } catch (err) {
      showToast('Failed to delete task: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Configuration saved callback
  const handleConfigSaved = () => {
    const { isConfigured } = initSupabaseClient();
    setIsSupabase(isConfigured);
    loadTasks(true);
    showToast(
      isConfigured ? 'Connected to Supabase database!' : 'Switched to local storage mode',
      'success'
    );
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Navigation & Header */}
      <Header
        onOpenNewTask={handleOpenNewTask}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSupabaseMode={isSupabase}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Dashboard Container */}
      <main className="main-content">
        <div className="content-container">
          {/* Key Metrics & Progress */}
          <StatsDashboard stats={metrics} />

          {/* Search, Filter, and Sort Controls */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilters={handleResetFilters}
            taskCounts={metrics}
          />

          {/* Task Items List */}
          <section className="tasks-section" aria-label="Tasks list">
            <div className="tasks-section-header">
              <h2 className="tasks-section-title">
                {statusFilter === 'all'
                  ? 'All Tasks'
                  : statusFilter === 'completed'
                  ? 'Completed Tasks'
                  : 'Pending Tasks'}
                <span className="tasks-count-pill">{tasks.length}</span>
              </h2>
            </div>

            <TaskList
              tasks={tasks}
              loading={loading}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              onToggleStatus={handleToggleStatus}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onOpenNewTask={handleOpenNewTask}
              onResetFilters={handleResetFilters}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-text">
            <strong>TaskFlow</strong> &bull; Built with React, Supabase & Modern CSS &bull; Full CRUD Task Manager
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
        isDeleting={isDeleting}
      />

      <SupabaseModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={handleConfigSaved}
      />
    </div>
  );
}

