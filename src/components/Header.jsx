import { useState } from 'react';
import { clearAuth } from '../services/chatApi';
import { LogOut, FileText, UserCheck, ShieldAlert, Radio } from 'lucide-react';

export default function Header({ username, role, conversationId, onLogout, onExport }) {
  const [exporting, setExporting] = useState(false);

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
        <div className="logo-badge animated-pulse-ring">
          <ShieldAlert size={20} />
        </div>
        <div className="header-title-group">
          <span className="app-title">KSP COMMAND CENTER</span>
          <span className="app-subtitle">
            Karnataka State Police · SCRB Crime Intelligence Platform
          </span>
        </div>
      </div>

      <div className="header-right-nav">
        {/* Live System Indicator Badge */}
        <div className="status-badge-live" title="Connected to Live Zoho Catalyst Database">
          <Radio size={12} className="live-radio-pulse" />
          <span>LIVE SYSTEM</span>
        </div>

        <div className="nav-divider" />

        {/* User Profile & Role */}
        {username && (
          <div className="user-profile-badge">
            <div className="user-avatar-circle">
              <UserCheck size={13} />
            </div>
            <span className="user-name-text">{username}</span>
            <span className={`role-chip-tag ${role || 'investigator'}`}>
              {role || 'INVESTIGATOR'}
            </span>
          </div>
        )}

        <div className="nav-divider" />

        {/* Export Brief Button */}
        <button
          type="button"
          className="header-action-btn export-btn"
          onClick={handleExport}
          disabled={exporting || !conversationId}
          title={!conversationId ? "Start a conversation to export intelligence brief" : "Export chat history to PDF"}
        >
          <FileText size={13} />
          <span>{exporting ? 'Exporting...' : 'Export Brief'}</span>
        </button>

        {/* Exit Button */}
        <button type="button" className="header-action-btn exit-btn" onClick={handleLogout} title="Exit session">
          <LogOut size={13} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}

