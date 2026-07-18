import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function NetworkGraph({ graph, onSelectNode, selectedNode }) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Adding a fallback/buffer to avoid scrollbars
        const width = Math.floor(entry.contentRect.width) || 800;
        const height = Math.floor(entry.contentRect.height) || 600;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Format graph data for react-force-graph (requires nodes and links arrays)
  const formattedData = {
    nodes: (graph?.nodes || []).map(node => ({
      ...node,
      // If node is currently selected, make it visually distinct
      val: node.id === selectedNode?.id ? 14 : 8
    })),
    links: (graph?.edges || []).map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.label
    }))
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      const zoom = graphRef.current.zoom();
      graphRef.current.zoom(zoom * 1.3, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const zoom = graphRef.current.zoom();
      graphRef.current.zoom(zoom / 1.3, 400);
    }
  };

  const handleRecenter = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(600, 50);
    }
  };

  // Node drawing logic on canvas
  const drawNode = (node, ctx, globalScale) => {
    const isSelected = selectedNode && node.id === selectedNode.id;
    
    // Theme colors matching index.css vars
    let color = '#38bdf8'; // fallback blue
    if (node.type === 'case') color = '#8b5cf6'; // Case - Violet
    else if (node.type === 'accused') color = '#ef4444'; // Accused - Red
    else if (node.type === 'victim') color = '#f59e0b'; // Victim - Amber
    else if (node.type === 'location') color = '#10b981'; // Location - Emerald

    const radius = node.type === 'case' ? 10 : 7.5;
    const finalRadius = isSelected ? radius * 1.35 : radius;

    // Glowing border for selected node
    if (isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(node.x, node.y, finalRadius + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    } else {
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
    }

    // Main node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, finalRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // Reset shadow blur
    ctx.shadowBlur = 0;

    // Node outline border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    // Node text label
    const label = node.label || node.id;
    const fontSize = 10.5 / globalScale;
    ctx.font = `500 ${fontSize}px 'Outfit', sans-serif`;
    
    // Label text shadow/background for legibility
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(5, 7, 14, 0.75)';
    ctx.fillRect(
      node.x - textWidth / 2 - 4 / globalScale, 
      node.y + finalRadius + (4 / globalScale), 
      textWidth + 8 / globalScale, 
      fontSize + 4 / globalScale
    );

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(248, 250, 252, 0.85)';
    ctx.fillText(label, node.x, node.y + finalRadius + 6 / globalScale);
  };

  return (
    <div className="graph-pane" ref={containerRef}>
      {/* Legend overlay */}
      <div className="graph-legend glass-panel">
        <span className="legend-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Network size={12} style={{ color: 'var(--accent-blue)' }} />
          <span>Intelligence Legend</span>
        </span>
        <div className="legend-item">
          <span className="legend-color case"></span>
          <span>Case Records</span>
        </div>
        <div className="legend-item">
          <span className="legend-color accused"></span>
          <span>Accused Suspects</span>
        </div>
        <div className="legend-item">
          <span className="legend-color victim"></span>
          <span>Victims / Complainants</span>
        </div>
        <div className="legend-item">
          <span className="legend-color location"></span>
          <span>Locations of Interest</span>
        </div>
      </div>

      {/* Graph canvas controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 5
      }}>
        <button className="btn-logout" onClick={handleZoomIn} title="Zoom In" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
          <ZoomIn size={14} />
        </button>
        <button className="btn-logout" onClick={handleZoomOut} title="Zoom Out" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
          <ZoomOut size={14} />
        </button>
        <button className="btn-logout" onClick={handleRecenter} title="Fit to View" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
          <Maximize2 size={14} />
        </button>
      </div>

      {formattedData.nodes.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)'
        }}>
          <Network size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <span>No network entities loaded. Query the database to populate.</span>
        </div>
      ) : (
        <ForceGraph2D
          ref={graphRef}
          graphData={formattedData}
          width={dimensions.width}
          height={dimensions.height}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(node, color, ctx) => {
            // Define clickable hit-boxes around nodes
            const radius = node.type === 'case' ? 14 : 11;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fill();
          }}
          onNodeClick={(node) => {
            onSelectNode(node);
          }}
          onBackgroundClick={() => {
            onSelectNode(null);
          }}
          linkColor={() => 'rgba(255, 255, 255, 0.12)'}
          linkWidth={1.5}
          linkDirectionalParticles={3}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleWidth={1.8}
          d3VelocityDecay={0.4} // stabilizes rendering layout quickly
        />
      )}
    </div>
  );
}
