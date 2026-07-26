import { useState } from 'react';
import { login } from '../services/chatApi';
import {
  ShieldAlert, Lock, User, AlertTriangle, Eye, EyeOff,
  Terminal, Network, Languages, TrendingUp, Search, Sparkles, ArrowRight, Zap, Volume2, Mic
} from 'lucide-react';

const CAPABILITIES = [
  {
    icon: Terminal,
    title: 'Conversational ZCQL',
    desc: 'Natural language directly compiled into optimized ZCQL database queries with full audit.',
    color: '#38bdf8'
  },
  {
    icon: Network,
    title: 'Network Graph Extraction',
    desc: 'Live node-edge relationship graphs linking cases, suspects, victims and police stations.',
    color: '#8b5cf6'
  },
  {
    icon: Languages,
    title: 'Kannada Language Support',
    desc: 'Full native bilingual Kannada query understanding with regional language AI responses.',
    color: '#10b981'
  },
  {
    icon: TrendingUp,
    title: 'Crime Trend Detection',
    desc: 'Predictive insights and temporal/spatial crime pattern analysis across jurisdictions.',
    color: '#f59e0b'
  },
  {
    icon: Search,
    title: 'Audit Trail Explainability',
    desc: 'Row-level citation of every source record the AI used to generate its answer.',
    color: '#ef4444'
  }
];

const QUICK_PILLS = [
  {
    label: 'Show me the trend of crimes registered at Station 55.',
    badge: '📈 Trend',
    color: '#f59e0b'
  },
  {
    label: 'Give me a breakdown of case statuses.',
    badge: '📊 ZCQL',
    color: '#38bdf8'
  },
  {
    label: 'How many cases were charge sheeted in the last year?',
    badge: '⚖️ Analytics',
    color: '#8b5cf6'
  },
  {
    label: 'ನಮಸ್ಕಾರ, ಇತ್ತೀಚಿನ ಪ್ರಕರಣಗಳು ಯಾವುವು?',
    badge: '🇮🇳 ಕನ್ನಡ',
    color: '#10b981'
  }
];

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('investigator_1');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [loadingPill, setLoadingPill] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Login and optionally fire a quickQuery on entry
  const handleLogin = async (quickQuery = null, pillIdx = null) => {
    const userToUse = username.trim() || 'investigator_1';
    const passToUse = password.trim() || 'password123';

    if (pillIdx !== null) setLoadingPill(pillIdx);
    else setLoading(true);
    setError(null);

    try {
      const data = await login(userToUse, passToUse);
      onLoginSuccess(userToUse, data.token, data.role, quickQuery);
    } catch (err) {
      setError(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
      setLoadingPill(null);
    }
  };

  return (
    <div className="landing-root">
      {/* Animated background grid & floating particle Orbs */}
      <div className="landing-bg-grid" aria-hidden="true" />
      <div className="landing-bg-radials" aria-hidden="true" />
      <div className="glowing-orb orb-1" aria-hidden="true" />
      <div className="glowing-orb orb-2" aria-hidden="true" />

      <div className="landing-content">

        {/* ── TOP SECTION: PROMINENT LOGIN CARD FIRST + HERO ─────── */}
        <section className="landing-top-hero-grid">
          
          {/* 1. LOGIN CARD AT TOP FIRST */}
          <div className="login-card-v2 glass-panel primary-focus-login">
            <div className="login-header-group">
              <div className="login-logo-v2 animated-pulse-ring">
                <ShieldAlert size={28} />
                <Zap size={14} className="logo-zap" />
              </div>
              <h3 className="login-title">Intelligence Portal Access</h3>
              <p className="login-subtitle">Authenticate your officer credentials to start</p>
            </div>

            <form
              className="login-form"
              onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            >
              <div className="input-group">
                <label className="input-label" htmlFor="username">Officer ID</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    id="username"
                    type="text"
                    className="input-field glow-on-focus"
                    placeholder="investigator_1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '36px', width: '100%' }}
                    disabled={loading || loadingPill !== null}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">Passcode</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field glow-on-focus"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '36px', paddingRight: '40px', width: '100%' }}
                    disabled={loading || loadingPill !== null}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error animated-shake">
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="login-btn glow-button"
                disabled={loading || loadingPill !== null}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />Initializing Terminal...</>
                ) : 'Launch Intelligence Terminal →'}
              </button>
            </form>

            <p className="login-footer-info">
              ⚡ Demo credentials pre-filled. Instant ZCQL access.
            </p>
          </div>

          {/* 2. HERO HEADLINE & BADGES RIGHT NEXT TO / BESIDE TOP LOGIN */}
          <div className="landing-hero-side">
            <div className="hero-ksp-badge animated-badge">
              <ShieldAlert size={18} />
              <span>KARNATAKA STATE POLICE · DATATHON 2026</span>
            </div>
            <h1 className="hero-headline">
              <span className="hero-headline-accent">Crime Intelligence</span>
              <br />Command Terminal
            </h1>
            <p className="hero-subtext">
              Conversational AI wired to a live Karnataka crime database — featuring natural language queries, ZCQL compilation, interactive network graphs, voice input, and native Kannada support.
            </p>

            {/* Live status chips with pulse animations */}
            <div className="hero-live-chips">
              <span className="live-chip green"><span className="live-dot" />Backend Live</span>
              <span className="live-chip blue"><span className="live-dot blue-dot" />ZCQL Engine Active</span>
              <span className="live-chip purple"><span className="live-dot purple-dot" />PDF Export Ready</span>
              <span className="live-chip orange"><span className="live-dot orange-dot" />Voice AI Ready</span>
            </div>
          </div>

        </section>

        {/* ── QUICK-START DEMO PILLS ─────────────────────────────── */}
        <section className="pills-section glass-panel animated-section-enter" aria-label="Quick-start queries">
          <div className="pills-header">
            <Sparkles size={18} className="sparkle-spin" style={{ color: '#38bdf8' }} />
            <h3>Quick-Start Intelligence Demos</h3>
            <span className="pills-hint">Click any pill to launch & auto-run query immediately</span>
          </div>
          <div className="pills-list">
            {QUICK_PILLS.map((pill, i) => (
              <button
                key={i}
                type="button"
                className="quick-pill-btn animated-pill-card"
                style={{ '--pill-color': pill.color }}
                onClick={() => handleLogin(pill.label, i)}
                disabled={loading || loadingPill !== null}
              >
                <div className="pill-top-row">
                  <span className="pill-badge" style={{ color: pill.color, borderColor: pill.color + '40', background: pill.color + '15' }}>
                    {pill.badge}
                  </span>
                  {loadingPill === i ? (
                    <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  ) : (
                    <ArrowRight size={14} className="pill-arrow" style={{ color: pill.color }} />
                  )}
                </div>
                <p className="pill-text">"{pill.label}"</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── SYSTEM CAPABILITIES ────────────────────────────────── */}
        <section className="capabilities-strip" aria-label="System capabilities">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className="cap-card glass-panel animated-cap-card" style={{ '--cap-color': cap.color, animationDelay: `${0.1 * i}s` }}>
                <div className="cap-icon-ring">
                  <Icon size={20} style={{ color: cap.color }} />
                </div>
                <h4 className="cap-title">{cap.title}</h4>
                <p className="cap-desc">{cap.desc}</p>
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
}

