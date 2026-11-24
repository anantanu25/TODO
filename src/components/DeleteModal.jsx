import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, task, isDeleting }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen || !task) return null;

  return (
    <div className="modal-backdrop" onClick={!isDeleting ? onClose : undefined} role="dialog" aria-modal="true">
      <div className="modal-card modal-confirm-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="confirm-icon-wrap">
          <div className="confirm-warning-badge">
            <AlertTriangle size={28} />
          </div>
        </div>

        <div className="confirm-content">
          <h2 className="confirm-title">Delete Task?</h2>
          <p className="confirm-text">
            Are you sure you want to permanently delete{' '}
            <strong className="delete-task-preview">"{task.title}"</strong>?
          </p>
          <p className="confirm-subtext">
            This action cannot be undone and will remove the task from your database.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="modal-actions confirm-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-danger"
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

