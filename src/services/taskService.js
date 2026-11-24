import {
  supabase,
  isUsingSupabase,
  getLocalTasks,
  saveLocalTasks,
  getSupabaseCredentials
} from '../lib/supabase';

/**
 * Task Service providing CRUD operations:
 * - Read (fetchTasks)
 * - Create (createTask)
 * - Update (updateTask, toggleTaskStatus)
 * - Delete (deleteTask)
 */

export const taskService = {
  /**
   * Test database connectivity
   */
  async testConnection() {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured || !supabase) {
      return {
        success: false,
        mode: 'local',
        message: 'Running in Local Storage / Demo mode. Add your Supabase credentials to sync to the cloud database.'
      };
    }

    try {
      const { data, error } = await supabase.from('tasks').select('id').limit(1);
      if (error) {
        return {
          success: false,
          mode: 'error',
          message: `Supabase query error: ${error.message}. Please check if the 'tasks' table is created with RLS enabled.`
        };
      }
      return {
        success: true,
        mode: 'supabase',
        message: 'Successfully connected to Supabase database!'
      };
    } catch (err) {
      return {
        success: false,
        mode: 'error',
        message: `Network/Connection error: ${err.message}`
      };
    }
  },

  /**
   * READ: Fetch all tasks with optional search, status filter, priority filter, and sorting
   */
  async fetchTasks({ search = '', status = 'all', priority = 'all', sortBy = 'created_desc' } = {}) {
    let tasks = [];

    if (isUsingSupabase && supabase) {
      try {
        let query = supabase.from('tasks').select('*');

        // Apply status filter
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        // Apply priority filter
        if (priority && priority !== 'all') {
          query = query.eq('priority', priority);
        }

        // Apply sort
        switch (sortBy) {
          case 'due_asc':
            query = query.order('due_date', { ascending: true, nullsFirst: false });
            break;
          case 'due_desc':
            query = query.order('due_date', { ascending: false, nullsFirst: false });
            break;
          case 'created_asc':
            query = query.order('created_at', { ascending: true });
            break;
          case 'priority_desc':
            // High -> Medium -> Low handled client-side or by query order
            query = query.order('created_at', { ascending: false });
            break;
          case 'created_desc':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) {
          console.warn('Supabase fetch failed, falling back to local storage:', error.message);
          tasks = getLocalTasks();
        } else {
          tasks = data || [];
        }
      } catch (err) {
        console.warn('Supabase network error, reading from local cache:', err);
        tasks = getLocalTasks();
      }
    } else {
      // Local Storage mode
      tasks = getLocalTasks();
    }

    // Client-side filtering for search query across title & description
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      tasks = tasks.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // In local storage mode or client-side fallback, apply status and priority filter
    if (!isUsingSupabase || !supabase) {
      if (status && status !== 'all') {
        tasks = tasks.filter(t => t.status === status);
      }
      if (priority && priority !== 'all') {
        tasks = tasks.filter(t => t.priority === priority);
      }

      // Sort local items
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => {
        if (sortBy === 'due_asc') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        }
        if (sortBy === 'due_desc') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(b.due_date) - new Date(a.due_date);
        }
        if (sortBy === 'priority_desc') {
          const diff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
          if (diff !== 0) return diff;
        }
        if (sortBy === 'created_asc') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        // default created_desc
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }

    return tasks;
  },

  /**
   * CREATE: Add a new task
   */
  async createTask({ title, description = '', priority = 'medium', due_date = null, status = 'pending' }) {
    if (!title || !title.trim()) {
      throw new Error('Task title is required');
    }

    const payload = {
      title: title.trim(),
      description: (description || '').trim(),
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      status: ['pending', 'completed'].includes(status) ? status : 'pending',
      due_date: due_date || null,
    };

    if (isUsingSupabase && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Sync local cache
      const local = getLocalTasks();
      saveLocalTasks([data, ...local]);
      return data;
    } else {
      // Local fallback
      const newTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const local = getLocalTasks();
      const updated = [newTask, ...local];
      saveLocalTasks(updated);
      return newTask;
    }
  },

  /**
   * UPDATE: Edit existing task details
   */
  async updateTask(id, updates) {
    if (!id) throw new Error('Task ID is required');

    const cleanUpdates = {};
    if (updates.title !== undefined) cleanUpdates.title = updates.title.trim();
    if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
    if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.due_date !== undefined) cleanUpdates.due_date = updates.due_date || null;
    cleanUpdates.updated_at = new Date().toISOString();

    if (isUsingSupabase && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Sync local cache
      const local = getLocalTasks();
      saveLocalTasks(local.map(t => (t.id === id ? { ...t, ...cleanUpdates } : t)));
      return data;
    } else {
      const local = getLocalTasks();
      const index = local.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');

      const updatedTask = { ...local[index], ...cleanUpdates };
      local[index] = updatedTask;
      saveLocalTasks(local);
      return updatedTask;
    }
  },

  /**
   * UPDATE: Toggle task status between 'pending' and 'completed'
   */
  async toggleTaskStatus(id, currentStatus) {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return this.updateTask(id, { status: nextStatus });
  },

  /**
   * DELETE: Delete a task by ID
   */
  async deleteTask(id) {
    if (!id) throw new Error('Task ID is required');

    if (isUsingSupabase && supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Sync local cache
      const local = getLocalTasks();
      saveLocalTasks(local.filter(t => t.id !== id));
      return { success: true, id };
    } else {
      const local = getLocalTasks();
      const filtered = local.filter(t => t.id !== id);
      saveLocalTasks(filtered);
      return { success: true, id };
    }
  },

  /**
   * Compute task metrics and statistics
   */
  async getMetrics() {
    let allTasks = [];
    if (isUsingSupabase && supabase) {
      try {
        const { data, error } = await supabase.from('tasks').select('id, status, priority, due_date');
        if (!error && data) {
          allTasks = data;
        } else {
          allTasks = getLocalTasks();
        }
      } catch {
        allTasks = getLocalTasks();
      }
    } else {
      allTasks = getLocalTasks();
    }

    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const highPriority = allTasks.filter(t => t.priority === 'high' && t.status === 'pending').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = allTasks.filter(
      t => t.status === 'pending' && t.due_date && t.due_date < todayStr
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      highPriority,
      overdue,
      completionRate,
    };
  }
};

