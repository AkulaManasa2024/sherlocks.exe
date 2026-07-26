import { ShieldAlert, Database, Building2, FileCheck2, Network, Sparkles, TrendingUp, Cpu, Languages, Mic } from 'lucide-react';

export default function KspOverview({ onQuickStart }) {
  return (
    <div className="ksp-overview-container glass-panel animated-fade-in">
      
      {/* Official Police Emblem & Header */}
      <div className="ksp-overview-hero">
        <div className="ksp-emblem-glow">
          <ShieldAlert size={42} />
          <div className="emblem-pulse-ring" />
        </div>
        <div className="ksp-title-group">
          <div className="ksp-badge-tag">
            <span>KARNATAKA STATE POLICE · SCRB</span>
          </div>
          <h2 className="ksp-main-title">Crime Intelligence Command Center</h2>
          <p className="ksp-subtitle">
            Statewide Automated Database Querying &amp; Network Analytics Platform
          </p>
        </div>
      </div>

      {/* Real-time SCRB System Metrics Grid */}
      <div className="ksp-metrics-grid">
        <div className="ksp-metric-card">
          <div className="metric-icon-box blue">
            <Building2 size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-num">1,100+</span>
            <span className="metric-title">Police Stations</span>
          </div>
        </div>

        <div className="ksp-metric-card">
          <div className="metric-icon-box purple">
            <Database size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-num">24,850+</span>
            <span className="metric-title">Registered FIRs</span>
          </div>
        </div>

        <div className="ksp-metric-card">
          <div className="metric-icon-box green">
            <FileCheck2 size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-num">18,420</span>
            <span className="metric-title">Charge Sheets</span>
          </div>
        </div>

        <div className="ksp-metric-card">
          <div className="metric-icon-box amber">
            <Network size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-num">8,900+</span>
            <span className="metric-title">Graph Entities</span>
          </div>
        </div>
      </div>

      {/* System Features Featurettes */}
      <div className="ksp-features-grid">
        <div className="featurette-box">
          <Cpu size={16} style={{ color: '#38bdf8' }} />
          <div>
            <h5 className="feat-title">Conversational ZCQL</h5>
            <p className="feat-desc">Natural language to live database query compiler.</p>
          </div>
        </div>

        <div className="featurette-box">
          <Network size={16} style={{ color: '#8b5cf6' }} />
          <div>
            <h5 className="feat-title">Graph Extraction</h5>
            <p className="feat-desc">Suspect, victim &amp; station entity relationships.</p>
          </div>
        </div>

        <div className="featurette-box">
          <Languages size={16} style={{ color: '#10b981' }} />
          <div>
            <h5 className="feat-title">Kannada Native</h5>
            <p className="feat-desc">Complete bilingual query understanding &amp; synthesis.</p>
          </div>
        </div>

        <div className="featurette-box">
          <Mic size={16} style={{ color: '#f59e0b' }} />
          <div>
            <h5 className="feat-title">Voice &amp; Read Aloud</h5>
            <p className="feat-desc">Hands-free speech-to-text &amp; voice briefing audio.</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="ksp-cta-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} className="sparkle-spin" style={{ color: '#38bdf8' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Ready for Analysis
          </span>
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
          Type a question in the chat pane or click below to launch an instant demo query.
        </p>
        <button
          type="button"
          className="glow-button-blue"
          style={{ width: '100%', padding: '10px', fontSize: '0.8rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 600 }}
          onClick={() => onQuickStart && onQuickStart("How many cases were charge sheeted in the last year?")}
        >
          <TrendingUp size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Run Demo Query: Charge-Sheeted Cases Analysis →
        </button>
      </div>

    </div>
  );
}
