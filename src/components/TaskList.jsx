import React from 'react';
import TaskCard from './TaskCard';
import { ClipboardList, PlusCircle, SearchX } from 'lucide-react';

export default function TaskList({
  tasks,
  loading,
  searchQuery,
  statusFilter,
  priorityFilter,
  onToggleStatus,
  onEdit,
  onDelete,
  onOpenNewTask,
  onResetFilters
}) {
  if (loading) {
    return (
      <div className="tasks-loading-skeleton">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton-card">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line desc"></div>
            <div className="skeleton-footer">
              <div className="skeleton-pill"></div>
              <div className="skeleton-pill"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (tasks.length === 0) {
    const isFiltered = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all';

    return (
      <div className="empty-state-card">
        <div className="empty-state-illustration">
          {isFiltered ? <SearchX size={44} /> : <ClipboardList size={44} />}
        </div>
        <h3 className="empty-state-title">
          {isFiltered ? 'No matching tasks found' : 'No tasks in your list yet'}
        </h3>
        <p className="empty-state-description">
          {isFiltered
            ? 'We could not find any tasks matching your active search or filters. Try adjusting your query or resetting filters.'
            : 'Get organized! Create your first task to plan out your day, set priorities, and track your accomplishments.'}
        </p>

        <div className="empty-state-actions">
          {isFiltered ? (
            <button onClick={onResetFilters} className="btn-secondary">
              Clear All Filters
            </button>
          ) : (
            <button onClick={onOpenNewTask} className="btn-primary">
              <PlusCircle size={18} />
              <span>Create Your First Task</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

