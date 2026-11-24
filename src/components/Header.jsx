import React from 'react';
import { CheckSquare, Plus, RefreshCw, Database, Sparkles, Settings } from 'lucide-react';

export default function Header({ onOpenNewTask, onOpenSettings, isSupabaseMode, onRefresh, isRefreshing }) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="brand-group">
          <div className="logo-badge">
            <CheckSquare className="logo-icon" size={24} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1 className="brand-title">TaskFlow</h1>
              <span className="badge-pro">TODO</span>
            </div>
            <p className="brand-subtitle">Smart task manager with real-time Supabase sync</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Supabase Status Button / Pill */}
          <button
            onClick={onOpenSettings}
            className={`connection-pill ${isSupabaseMode ? 'connected' : 'local-mode'}`}
            title="Click to view or edit Supabase database connection"
          >
            <span className="status-dot"></span>
            <Database size={15} />
            <span className="connection-text">
              {isSupabaseMode ? 'Supabase Connected' : 'Local Mode'}
            </span>
            <Settings size={14} className="settings-icon" />
          </button>

          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            className={`btn-icon ${isRefreshing ? 'spinning' : ''}`}
            title="Refresh tasks"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} />
          </button>

          {/* New Task Button */}
          <button onClick={onOpenNewTask} className="btn-primary">
            <Plus size={18} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}

