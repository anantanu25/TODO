import React from 'react';
import {
  Calendar,
  Check,
  Edit2,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function TaskCard({ task, onToggleStatus, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed';

  // Format Due Date and detect overdue
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { text: dateStr, isOverdue: false, isToday: false };

    const due = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options = { month: 'short', day: 'numeric', year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined };
    const dateFormatted = due.toLocaleDateString(undefined, options);

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return {
        text: `${dateFormatted} (${daysOverdue}d overdue)`,
        isOverdue: true,
        isToday: false,
      };
    } else if (diffDays === 0) {
      return { text: `Today (${dateFormatted})`, isOverdue: false, isToday: true };
    } else if (diffDays === 1) {
      return { text: `Tomorrow (${dateFormatted})`, isOverdue: false, isToday: false };
    } else {
      return { text: dateFormatted, isOverdue: false, isToday: false };
    }
  };

  const dueInfo = formatDueDate(task.due_date);

  // Priority metadata
  const priorityConfig = {
    high: { label: 'High', colorClass: 'priority-high', dot: '🔴' },
    medium: { label: 'Medium', colorClass: 'priority-medium', dot: '🟡' },
    low: { label: 'Low', colorClass: 'priority-low', dot: '🟢' },
  };

  const priorityMeta = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <article className={`task-card ${isCompleted ? 'task-completed' : ''} priority-border-${task.priority}`}>
      <div className="task-card-inner">
        {/* Toggle Checkbox */}
        <div className="task-checkbox-wrap">
          <button
            type="button"
            className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
            onClick={() => onToggleStatus(task.id, task.status)}
            aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
            title={isCompleted ? 'Click to mark as pending' : 'Click to mark as completed'}
          >
            {isCompleted && <Check size={14} strokeWidth={3} />}
          </button>
        </div>

        {/* Task Content */}
        <div className="task-content">
          <div className="task-header-line">
            <h3 className={`task-title ${isCompleted ? 'strike' : ''}`}>
              {task.title}
            </h3>

            {/* Badges */}
            <div className="task-badges">
              <span className={`priority-badge ${priorityMeta.colorClass}`}>
                <span className="priority-dot"></span>
                {priorityMeta.label}
              </span>

              <span className={`status-badge ${isCompleted ? 'status-completed' : 'status-pending'}`}>
                {isCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`task-description ${isCompleted ? 'strike-light' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="task-footer">
            <div className="task-meta-group">
              {/* Due Date Indicator */}
              {dueInfo && (
                <div
                  className={`meta-item due-date-pill ${
                    !isCompleted && dueInfo.isOverdue
                      ? 'overdue'
                      : !isCompleted && dueInfo.isToday
                      ? 'due-today'
                      : ''
                  }`}
                  title={dueInfo.isOverdue && !isCompleted ? 'This task is past its due date' : 'Due date'}
                >
                  <Calendar size={13} />
                  <span>{dueInfo.text}</span>
                </div>
              )}

              {/* Created Date */}
              <div className="meta-item created-date">
                <Clock size={13} />
                <span>
                  Added {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="task-actions">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="btn-card-action edit-btn"
                title="Edit task"
                aria-label={`Edit task ${task.title}`}
              >
                <Edit2 size={15} />
                <span className="action-text">Edit</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(task)}
                className="btn-card-action delete-btn"
                title="Delete task"
                aria-label={`Delete task ${task.title}`}
              >
                <Trash2 size={15} />
                <span className="action-text">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

