import React from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  onResetFilters,
  taskCounts
}) {
  const isFiltered = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'created_desc';

  return (
    <div className="filter-controls-card">
      <div className="filter-top-row">
        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="search-clear-btn"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="sort-wrapper">
          <label htmlFor="sort-select" className="filter-label">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="select-input"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="due_asc">Due Date (Earliest)</option>
            <option value="due_desc">Due Date (Latest)</option>
            <option value="priority_desc">Priority (High to Low)</option>
          </select>
        </div>
      </div>

      <div className="filter-bottom-row">
        {/* Status Filter Tabs */}
        <div className="status-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={statusFilter === 'all'}
            onClick={() => onStatusChange('all')}
            className={`tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
          >
            All
            <span className="tab-count">{taskCounts.total}</span>
          </button>
          <button
            role="tab"
            aria-selected={statusFilter === 'pending'}
            onClick={() => onStatusChange('pending')}
            className={`tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
          >
            Pending
            <span className="tab-count count-pending">{taskCounts.pending}</span>
          </button>
          <button
            role="tab"
            aria-selected={statusFilter === 'completed'}
            onClick={() => onStatusChange('completed')}
            className={`tab-btn ${statusFilter === 'completed' ? 'active' : ''}`}
          >
            Completed
            <span className="tab-count count-completed">{taskCounts.completed}</span>
          </button>
        </div>

        {/* Priority Filter & Reset */}
        <div className="priority-filter-group">
          <div className="priority-select-wrap">
            <span className="filter-sublabel">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="select-input select-priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="btn-ghost btn-reset"
              title="Reset all active filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

