import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Shield, Copy, Check, ChevronDown, ChevronUp, Database, FileText } from 'lucide-react';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        background: 'none',
        border: 'none',
        color: copied ? '#10b981' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        padding: '2px 6px',
        borderRadius: '4px',
        transition: 'all 0.2s'
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy ZCQL'}
    </button>
  );
}

function ExplanationPanel({ zcql, sources, resultRows }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!zcql && (!sources || sources.length === 0) && (!resultRows || resultRows.length === 0)) {
    return null;
  }

  return (
    <div className="explain-panel">
      <div className="explain-header" onClick={() => setIsOpen(!isOpen)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={12} />
          <span>EXPLAINABILITY & QUERY FOOTPRINT</span>
        </span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>
      
      {isOpen && (
        <div className="explain-content">
          {zcql && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="query-title">Generated ZCQL Query</span>
                <CopyBtn text={zcql} />
              </div>
              <pre className="query-code"><code>{zcql}</code></pre>
            </div>
          )}

          {resultRows && resultRows.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <span className="query-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} />
                <span>Raw Database Result ({resultRows.length} {resultRows.length === 1 ? 'row' : 'rows'})</span>
              </span>
              <div style={{ overflowX: 'auto', marginTop: '6px', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-light)' }}>
                      {Object.keys(resultRows[0]).map(key => (
                        <th key={key} style={{ padding: '6px 8px', color: 'var(--text-secondary)', fontWeight: 600 }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < resultRows.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                        {Object.values(row).map((val, i) => (
                          <th key={i} style={{ padding: '6px 8px', color: 'var(--text-primary)', fontWeight: 400 }}>
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sources && sources.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <span className="sources-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={12} />
                <span>Indexed Sources</span>
              </span>
              <div className="sources-list" style={{ marginTop: '6px' }}>
                {sources.map((src, idx) => (
                  <div key={idx} className="source-item">
                    {src}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatContainer({ messages, onSendMessage, loading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestedClick = (queryText) => {
    if (loading) return;
    onSendMessage(queryText);
  };

  return (
    <div className="chat-pane">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="empty-chat-icon">
              <Shield size={36} />
            </div>
            <h3 className="empty-chat-title">Secure Investigation Terminal</h3>
            <p className="empty-chat-text">
              Enter natural language queries to search the crime database. The system will compile the results, generate graph views, and display direct audit queries.
            </p>
            
            <div className="suggested-queries">
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Suggested Database Queries
              </span>
              <button 
                className="suggested-query-btn" 
                onClick={() => handleSuggestedClick('Sovereign Trust Bank Robbery')}
                disabled={loading}
              >
                🔍 Analyze Sovereign Trust Bank Robbery (Case 101)
              </button>
              <button 
                className="suggested-query-btn" 
                onClick={() => handleSuggestedClick('Marcus Vance')}
                disabled={loading}
              >
                👤 Inspect Suspect Profile: Marcus Vance
              </button>
              <button 
                className="suggested-query-btn" 
                onClick={() => handleSuggestedClick('Serena Chen Syndicate')}
                disabled={loading}
              >
                👤 Inspect Suspect Profile: Serena Chen Syndicate
              </button>
              <button 
                className="suggested-query-btn" 
                onClick={() => handleSuggestedClick('Warehouse cargo theft')}
                disabled={loading}
              >
                📦 Search Warehouse Cargo Theft Incidents
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                {msg.sender === 'system' && (
                  <ExplanationPanel 
                    zcql={msg.zcql_query} 
                    sources={msg.sources} 
                    resultRows={msg.result_rows}
                  />
                )}
              </div>
              <div className="message-time">
                {msg.timestamp ? msg.timestamp : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="message-wrapper system">
            <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
              <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Compiling NL-to-ZCQL Query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            className="chat-input"
            placeholder={loading ? "Generating query..." : "Query suspect, case or location..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-send" disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
