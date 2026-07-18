import { useState } from 'react';
import { clearAuth } from '../services/chatApi';
import { LogOut, FileText, Server, UserCheck, ShieldAlert } from 'lucide-react';

export default function Header({ username, role, conversationId, onLogout, onExport }) {
  const [exporting, setExporting] = useState(false);
  const isMock = (import.meta.env.VITE_API_BASE_URL || 'mock') === 'mock';

  const handleExport = async () => {
    if (!conversationId) return;
    setExporting(true);
    try {
      await onExport(conversationId);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    onLogout();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-badge">
          <ShieldAlert size={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="app-title" style={{ fontWeight: 700 }}>KSP COMMAND CENTER</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Crime Network Analytics & Query Engine
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Environment Status Badge */}
        <div className="token-indicator" title={isMock ? "Running on Mock Data seam" : "Connected to live API backend"}>
          <span className={`token-dot ${isMock ? 'expired' : ''}`} style={{ backgroundColor: isMock ? '#ef4444' : '#10b981' }}></span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {isMock ? 'MOCK SYSTEM' : 'LIVE SYSTEM'}
          </span>
        </div>

        {/* User profile & Role badge */}
        {username && (
          <div className="user-profile-info" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
            <UserCheck size={14} style={{ color: 'var(--text-secondary)' }} />
            <span className="username-display">{username}</span>
            <span className={`role-badge-header ${role}`}>
              {role}
            </span>
          </div>
        )}

        {/* Export Conversation PDF */}
        <button
          className="btn-export"
          onClick={handleExport}
          disabled={exporting || !conversationId}
          title={!conversationId ? "Start a conversation to export history" : "Export chat history to PDF"}
          style={{ opacity: !conversationId ? 0.5 : 1, cursor: !conversationId ? 'not-allowed' : 'pointer' }}
        >
          <FileText size={14} />
          {exporting ? 'Generating PDF...' : 'Export Brief'}
        </button>

        {/* Logout Button */}
        <button className="btn-logout" onClick={handleLogout} title="Logout of current terminal session">
          <LogOut size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}
