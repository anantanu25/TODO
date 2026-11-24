import React from 'react';
import { CheckCircle2, Clock, Flame, ListTodo, TrendingUp } from 'lucide-react';

export default function StatsDashboard({ stats }) {
  const { total = 0, completed = 0, pending = 0, highPriority = 0, completionRate = 0 } = stats || {};

  return (
    <div className="dashboard-metrics-section">
      <div className="metrics-grid">
        {/* Total Tasks */}
        <div className="metric-card total-card">
          <div className="metric-header">
            <span className="metric-label">Total Tasks</span>
            <div className="metric-icon-wrap icon-total">
              <ListTodo size={20} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="metric-value">{total}</h3>
            <span className="metric-hint">All scheduled tasks</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="metric-card pending-card">
          <div className="metric-header">
            <span className="metric-label">Pending</span>
            <div className="metric-icon-wrap icon-pending">
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="metric-value">{pending}</h3>
            <span className="metric-hint">Awaiting completion</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="metric-card completed-card">
          <div className="metric-header">
            <span className="metric-label">Completed</span>
            <div className="metric-icon-wrap icon-completed">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value-row">
              <h3 className="metric-value">{completed}</h3>
              <span className="badge-pill completion-rate-pill">
                {completionRate}%
              </span>
            </div>
            <span className="metric-hint">Successfully resolved</span>
          </div>
        </div>

        {/* High Priority Tasks */}
        <div className="metric-card priority-card">
          <div className="metric-header">
            <span className="metric-label">High Priority</span>
            <div className="metric-icon-wrap icon-priority">
              <Flame size={20} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="metric-value">{highPriority}</h3>
            <span className="metric-hint">Requires urgent focus</span>
          </div>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="progress-container">
        <div className="progress-info">
          <div className="progress-title-row">
            <TrendingUp size={16} className="progress-icon" />
            <span className="progress-title">Overall Productivity & Progress</span>
          </div>
          <span className="progress-numbers">
            <strong>{completed}</strong> of <strong>{total}</strong> tasks completed ({completionRate}%)
          </span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={completionRate} aria-valuemin="0" aria-valuemax="100">
          <div
            className="progress-fill"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

