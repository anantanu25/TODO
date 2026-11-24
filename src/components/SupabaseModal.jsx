import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle, AlertCircle, ExternalLink, Key, Link as LinkIcon, RefreshCw, Check } from 'lucide-react';
import {
  getSupabaseCredentials,
  saveCustomCredentials,
  clearCustomCredentials,
  isUsingSupabase
} from '../lib/supabase';
import { taskService } from '../services/taskService';

export default function SupabaseModal({ isOpen, onClose, onConfigSaved }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url || '');
      setKey(creds.key || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    // Temporarily save to test
    saveCustomCredentials(url, key);
    const result = await taskService.testConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = () => {
    saveCustomCredentials(url, key);
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleResetToLocal = () => {
    clearCustomCredentials();
    setUrl('');
    setKey('');
    setTestResult({
      success: true,
      mode: 'local',
      message: 'Reset to Local Storage mode.'
    });
    if (onConfigSaved) onConfigSaved();
  };

  const handleCopySchemaNotice = () => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card modal-settings-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="settings-header-icon">
              <Database size={22} />
            </div>
            <div>
              <h2 className="modal-title">Supabase Database Connection</h2>
              <p className="modal-subtitle">Connect your cloud PostgreSQL database or use local storage</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Status Indicator Banner */}
        <div className={`status-banner ${isUsingSupabase ? 'status-connected' : 'status-local'}`}>
          <div className="status-banner-icon">
            {isUsingSupabase ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          </div>
          <div>
            <strong>Current Mode: {isUsingSupabase ? 'Cloud Supabase Connected' : 'Local Storage / Demo Mode'}</strong>
            <p className="status-banner-text">
              {isUsingSupabase
                ? 'Tasks are securely synced and saved in your remote Supabase PostgreSQL database.'
                : 'Tasks are currently stored in your browser\'s LocalStorage so you can test all features right away.'}
            </p>
          </div>
        </div>

        {/* Connection Form */}
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} />
              <span>Project URL</span>
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
            />
            <span className="form-help-text">
              Found in your Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Key size={14} />
              <span>Anon Public API Key</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="form-input"
            />
            <span className="form-help-text">
              Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys (anon public)
            </span>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div className={`test-feedback ${testResult.success ? 'feedback-success' : 'feedback-error'}`}>
              {testResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Setup Guide Box */}
          <div className="quick-guide-box">
            <h4>Quick Database Setup (One-Click)</h4>
            <ol>
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a> and create a free project.</li>
              <li>Open the <strong>SQL Editor</strong> in your Supabase dashboard.</li>
              <li>Open and copy the provided file <code className="code-pill">supabase-schema.sql</code> from this project, paste it into the SQL Editor, and click <strong>Run</strong>.</li>
              <li>Copy your <strong>Project URL</strong> and <strong>Anon Key</strong> above and click <strong>Save & Connect</strong>!</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions space-between">
          <button
            type="button"
            onClick={handleResetToLocal}
            className="btn-ghost"
            title="Reset to local demo mode"
          >
            Use Local Storage
          </button>

          <div className="action-button-group">
            <button
              type="button"
              onClick={handleTest}
              className="btn-secondary"
              disabled={isTesting || !url || !key}
            >
              {isTesting ? <RefreshCw size={15} className="spinning" /> : <RefreshCw size={15} />}
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

