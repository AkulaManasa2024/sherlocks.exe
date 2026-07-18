import { getResponseForQuery } from '../mockData';

// Configurable base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'mock';

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
 * POST /chat
 * Request: { "question": "string", "conversation_id": "string|null" }
 */
export async function chat(question, conversationId = null) {
  if (API_BASE_URL === 'mock') {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Get response from mockData
    const mockResponse = getResponseForQuery(question);
    
    // Structure the response exactly as required by the locked API contract
    return {
      conversation_id: conversationId || `conv_${Math.random().toString(36).substr(2, 9)}`,
      answer: mockResponse.answer,
      zcql_query: mockResponse.zcql_query,
      result_rows: mockResponse.result_rows || [],
      graph: {
        nodes: (mockResponse.graph?.nodes || []).map(n => ({
          id: n.id,
          label: n.label,
          type: n.type,
          details: n.details // mock details for inspector
        })),
        edges: (mockResponse.graph?.edges || []).map(e => ({
          source: typeof e.source === 'object' ? e.source.id : e.source,
          target: typeof e.target === 'object' ? e.target.id : e.target,
          label: e.label
        }))
      },
      sources: mockResponse.sources || []
    };
  }

  // Real backend call
  const response = await request('/chat', {
    method: 'POST',
    body: JSON.stringify({ question, conversation_id: conversationId }),
  });
  
  return response.json();
}

/**
 * Single seam Login function
 * POST /login
 * Request: { "username": "string", "password": "string" }
 */
export async function login(username, password) {
  if (API_BASE_URL === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Assign role based on username substring, default to investigator
    const role = username.toLowerCase().includes('analyst') ? 'analyst' : 'investigator';
    const mockToken = `mock-jwt-token-for-${username}-${role}-${Date.now()}`;
    
    setAuth(mockToken, role, username);
    return { token: mockToken, role };
  }

  // Real backend call
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Invalid credentials');
  }

  const data = await response.json();
  setAuth(data.token, data.role, username);
  return data;
}

/**
 * Single seam Export history function
 * GET /export/{conversation_id} -> PDF blob download
 */
export async function exportHistory(conversationId) {
  if (API_BASE_URL === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Generate a dummy PDF file content
    const dummyPdfContent = `%PDF-1.4\n%... KSP Datathon 2026 Export File for Conversation: ${conversationId} ...`;
    const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ksp_export_${conversationId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return;
  }

  // Real backend call
  const response = await request(`/export/${conversationId}`, {
    method: 'GET',
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ksp_export_${conversationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
