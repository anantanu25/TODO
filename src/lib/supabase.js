import { createClient } from '@supabase/supabase-js';

// Keys stored in localStorage if user enters credentials directly in the app
const STORAGE_KEY_URL = 'taskflow_supabase_url';
const STORAGE_KEY_KEY = 'taskflow_supabase_key';
const LOCAL_TASKS_KEY = 'taskflow_local_tasks_data';

// Helper to retrieve credentials (prefers .env, falls back to localStorage)
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  const url = (envUrl && !envUrl.includes('your-project-id') ? envUrl : localUrl).trim();
  const key = (envKey && !envKey.includes('your-anon-key') ? envKey : localKey).trim();

  const isConfigured = Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    key.length > 20
  );

  return { url, key, isConfigured, isFromEnv: Boolean(envUrl && envUrl.includes('.supabase.co')) };
}

// Save credentials from UI
export function saveCustomCredentials(url, key) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  // Re-instantiate client
  initSupabaseClient();
}

// Clear custom credentials
export function clearCustomCredentials() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  initSupabaseClient();
}

// Local mock storage for initial out-of-the-box experience or demo mode
const INITIAL_DEMO_TASKS = [
  {
    id: '101a1111-2222-3333-4444-555566667771',
    title: 'Complete project documentation',
    description: 'Document the project structure, API integration, and deployment instructions.',
    priority: 'high',
    status: 'completed',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '101a1111-2222-3333-4444-555566667772',
    title: 'Connect Supabase backend & test CRUD',
    description: 'Configure Supabase database table and verify create, read, update, delete functionality.',
    priority: 'high',
    status: 'pending',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '101a1111-2222-3333-4444-555566667773',
    title: 'Build search & status filter controls',
    description: 'Add instant keyword search and tabs for All, Pending, and Completed tasks.',
    priority: 'medium',
    status: 'pending',
    due_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '101a1111-2222-3333-4444-555566667774',
    title: 'Verify mobile & tablet responsiveness',
    description: 'Test dashboard layout, cards, and modal dialogs across all screen sizes.',
    priority: 'low',
    status: 'pending',
    due_date: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export function getLocalTasks() {
  try {
    const data = localStorage.getItem(LOCAL_TASKS_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_TASKS;
  }
}

export function saveLocalTasks(tasks) {
  try {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Global active client
export let supabase = null;
export let isUsingSupabase = false;

export function initSupabaseClient() {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (isConfigured) {
    try {
      supabase = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      isUsingSupabase = true;
      return { client: supabase, isConfigured: true, url };
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabase = null;
      isUsingSupabase = false;
      return { client: null, isConfigured: false, error: err.message };
    }
  } else {
    supabase = null;
    isUsingSupabase = false;
    return { client: null, isConfigured: false };
  }
}

// Initialize on startup
initSupabaseClient();

