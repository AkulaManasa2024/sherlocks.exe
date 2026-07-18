import { X, Search, Link as LinkIcon, Compass } from 'lucide-react';

export default function InspectorPanel({ selectedNode, activeGraph, onClose, onQueryNode, onSelectNode }) {
  if (!selectedNode) {
    return (
      <div className="node-details-panel hidden"></div>
    );
  }

  // Find all edges connected to the selected node
  const connections = (activeGraph?.edges || []).filter(edge => {
    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
    return sourceId === selectedNode.id || targetId === selectedNode.id;
  }).map(edge => {
    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
    const isSource = sourceId === selectedNode.id;
    const peerId = isSource ? targetId : sourceId;
    const peerNode = (activeGraph?.nodes || []).find(n => n.id === peerId);
    
    return {
      edgeLabel: edge.label,
      peerId,
      peerLabel: peerNode ? peerNode.label : peerId,
      peerType: peerNode ? peerNode.type : 'unknown',
      peerNode
    };
  });

  return (
    <div className="node-details-panel glass-panel">
      <div className="node-details-header">
        <span className={`node-badge-type ${selectedNode.type}`}>
          {selectedNode.type}
        </span>
        <button className="btn-close-details" onClick={onClose} title="Close Panel">
          <X size={16} />
        </button>
      </div>

      <h3 className="node-details-title">{selectedNode.label || selectedNode.id}</h3>
      
      <p className="node-details-desc">
        {selectedNode.details || 'No detailed dossier content loaded in this mock record.'}
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          className="btn-export" 
          onClick={() => onQueryNode(selectedNode.label || selectedNode.id)}
          style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
          title="Send query to chatbot to filter nodes"
        >
          <Search size={12} style={{ marginRight: '4px' }} />
          Query Database
        </button>
      </div>

      <div className="node-details-meta">
        <span className="legend-title" style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
          <LinkIcon size={11} />
          <span>Case Relationships ({connections.length})</span>
        </span>
        
        {connections.length === 0 ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
            No active connections in this network slice.
          </span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
            {connections.map((conn, idx) => (
              <div 
                key={idx} 
                onClick={() => conn.peerNode && onSelectNode(conn.peerNode)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '6px 8px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '6px',
                  cursor: conn.peerNode ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
                className={conn.peerNode ? 'suggested-query-btn' : ''}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px'
                  }}>
                    {conn.peerLabel}
                  </span>
                  <span className={`node-badge-type ${conn.peerType}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                    {conn.peerType}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Compass size={10} />
                  {conn.edgeLabel || 'Connected'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
