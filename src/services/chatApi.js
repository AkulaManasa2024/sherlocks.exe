// Live backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ksp-datathon-60078827774.development.catalystserverless.in';

// Storage keys
const TOKEN_KEY = 'ksp_auth_token';
const ROLE_KEY = 'ksp_auth_role';
const USERNAME_KEY = 'ksp_auth_username';

/**
 * Get stored authentication token
 */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Get stored role
 */
export const getRole = () => localStorage.getItem(ROLE_KEY);

/**
 * Get stored username
 */
export const getUsername = () => localStorage.getItem(USERNAME_KEY);

/**
 * Set authentication credentials
 */
export const setAuth = (token, role, username) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USERNAME_KEY, username);
};

/**
 * Clear authentication credentials
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Helper to perform authenticated HTTP requests
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return response;
}

/**
 * Single seam Chat function
 * GET /server/nl-query-engine/execute?question=YOUR_QUESTION&conversation_id=OPTIONAL_ID
 */
export async function chat(question, conversationId = null) {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://ksp-datathon-60078827774.development.catalystserverless.in/server/nl-query-engine/execute';
    
    const url = new URL(baseUrl);
    url.searchParams.append('question', question);
    url.searchParams.append('export_pdf', 'true');
    if (conversationId) {
      url.searchParams.append('conversation_id', conversationId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || errorData.message || `Request failed with status ${response.status}`,
        attempted_query: errorData.attempted_query || null
      };
    }

    let data = await response.json();

    // Defensive parsing for double-stringified JSON or { output: "..." } response wrapper
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) {}
    }
    if (data && typeof data.output === 'string') {
      try { data = JSON.parse(data.output); } catch (e) {}
    }

    return data;
  } catch (err) {
    return {
      error: err.message || 'Network error connecting to backend service.',
      attempted_query: null
    };
  }
}

/**
 * Demo login — backend has no auth endpoint; we simulate credentials locally.
 * Role is assigned by username substring for demo purposes.
 */
export async function login(username, password) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const role = username.toLowerCase().includes('analyst') ? 'analyst' : 'investigator';
  const token = `ksp-session-${username}-${role}-${Date.now()}`;
  setAuth(token, role, username);
  return { token, role };
}

/**
 * Export history — PDF export is now handled inline via pdf_base64 in each chat response.
 * This function is a fallback that generates a simple summary PDF.
 */
export async function exportHistory(conversationId) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const dummyPdfContent = `%PDF-1.4\n%KSP Datathon 2026 Intelligence Report\n% Conversation: ${conversationId}\n% Note: Full PDF reports are generated per-query via the Download PDF button.`;
  const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ksp_report_${conversationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
