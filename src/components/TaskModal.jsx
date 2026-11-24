import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, AlignLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef(null);

  // Sync form state when modal opens or taskToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        setPriority(taskToEdit.priority || 'medium');
        setDueDate(taskToEdit.due_date || '');
        setStatus(taskToEdit.status || 'pending');
      } else {
        // Reset defaults for new task
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setStatus('pending');
      }
      setError('');
      setIsSubmitting(false);

      // Focus title input on modal open
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, taskToEdit]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      titleInputRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(taskToEdit);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update task details, priority, or completion status.'
                : 'Fill in the information below to add a new task to your dashboard.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            title="Close modal (Esc)"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="form-error-banner" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              placeholder="e.g. Design user profile wireframe..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="form-input"
              maxLength={255}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="task-desc" className="form-label">
              Description <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Add additional details, notes, or checklists..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Priority Selection */}
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <div className="priority-options-grid">
              {[
                { value: 'low', label: 'Low', color: 'low', desc: 'Can be done anytime' },
                { value: 'medium', label: 'Medium', color: 'medium', desc: 'Normal schedule' },
                { value: 'high', label: 'High', color: 'high', desc: 'Urgent attention' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`priority-choice-btn priority-${opt.color} ${
                    priority === opt.value ? 'selected' : ''
                  }`}
                >
                  <div className="choice-header">
                    <span className="priority-indicator"></span>
                    <span className="choice-title">{opt.label}</span>
                  </div>
                  <span className="choice-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row: Due Date & Status */}
          <div className="form-row-2col">
            {/* Due Date */}
            <div className="form-group">
              <label htmlFor="task-due-date" className="form-label">
                Due Date <span className="optional-tag">(Optional)</span>
              </label>
              <div className="input-icon-wrap">
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Status (especially useful when editing) */}
            <div className="form-group">
              <label htmlFor="task-status" className="form-label">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input form-select"
              >
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

