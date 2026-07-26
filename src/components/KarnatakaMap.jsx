import { useState } from 'react';
import { MapPin, ShieldAlert, TrendingUp, AlertTriangle, Building2, Flame, Layers } from 'lucide-react';

const DISTRICT_DATA = [
  { id: 'bengaluru', name: 'Bengaluru City', cases: 1420, risk: 'High', color: '#ef4444', lat: '12.9716° N', lon: '77.5946° E', stations: 112, topCrime: 'Cyber Crime & Theft' },
  { id: 'mysuru', name: 'Mysuru District', cases: 480, risk: 'Medium', color: '#f59e0b', lat: '12.2958° N', lon: '76.6394° E', stations: 45, topCrime: 'Property Offense' },
  { id: 'hubballi', name: 'Hubballi-Dharwad', cases: 610, risk: 'High', color: '#ef4444', lat: '15.3647° N', lon: '75.1240° E', stations: 38, topCrime: 'Traffic & Assault' },
  { id: 'mangaluru', name: 'Dakshina Kannada (Mangaluru)', cases: 390, risk: 'Medium', color: '#f59e0b', lat: '12.9141° N', lon: '74.8560° E', stations: 32, topCrime: 'Maritime & Fraud' },
  { id: 'belagavi', name: 'Belagavi District', cases: 520, risk: 'Medium', color: '#f59e0b', lat: '15.8497° N', lon: '74.4977° E', stations: 41, topCrime: 'Border Contraband' },
  { id: 'kalaburagi', name: 'Kalaburagi (Gulbarga)', cases: 410, risk: 'Low', color: '#10b981', lat: '17.3297° N', lon: '76.8343° E', stations: 35, topCrime: 'Land Disputes' },
  { id: 'udupi', name: 'Udupi District', cases: 210, risk: 'Low', color: '#10b981', lat: '13.3409° N', lon: '74.7421° E', stations: 22, topCrime: 'Cyber Fraud' },
  { id: 'ballari', name: 'Ballari District', cases: 340, risk: 'Medium', color: '#f59e0b', lat: '15.1394° N', lon: '76.9214° E', stations: 28, topCrime: 'Mining Disputes' }
];

export default function KarnatakaMap({ onSelectDistrict }) {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_DATA[0]);

  const handleDistrictClick = (d) => {
    setSelectedDistrict(d);
  };

  return (
    <div className="karnataka-map-container glass-panel">
      
      {/* Header */}
      <div className="map-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} style={{ color: 'var(--accent-blue)' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Karnataka Police Jurisdiction &amp; Hotspot Map
          </h3>
        </div>
        <span className="live-chip blue" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
          <span className="live-dot blue-dot" /> 1,100+ Stations Active
        </span>
      </div>

      {/* Main Map Body Grid */}
      <div className="map-body-grid">
        
        {/* District Selector Pins List */}
        <div className="map-district-list">
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            Select Jurisdiction / District
          </div>
          {DISTRICT_DATA.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`district-pill-btn ${selectedDistrict.id === d.id ? 'active' : ''}`}
              onClick={() => handleDistrictClick(d)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="district-dot" style={{ backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{d.name}</span>
              </div>
              <span className="risk-badge" style={{ color: d.color, borderColor: d.color + '40', background: d.color + '15' }}>
                {d.cases} cases
              </span>
            </button>
          ))}
        </div>

        {/* District Detail Dossier Card */}
        <div className="map-district-dossier">
          {selectedDistrict && (
            <div className="dossier-card animated-fade-in">
              <div className="dossier-header">
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    {selectedDistrict.name}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    GPS: {selectedDistrict.lat}, {selectedDistrict.lon}
                  </span>
                </div>
                <span className="risk-tag" style={{ background: selectedDistrict.color + '20', color: selectedDistrict.color, border: `1px solid ${selectedDistrict.color}50` }}>
                  <Flame size={12} /> {selectedDistrict.risk} Density
                </span>
              </div>

              {/* Quick Stat Badges */}
              <div className="dossier-stats-grid">
                <div className="dossier-stat-box">
                  <span className="stat-label"><ShieldAlert size={12} /> Registered FIRs</span>
                  <span className="stat-value">{selectedDistrict.cases}</span>
                </div>
                <div className="dossier-stat-box">
                  <span className="stat-label"><Building2 size={12} /> Police Stations</span>
                  <span className="stat-value">{selectedDistrict.stations}</span>
                </div>
              </div>

              <div className="dossier-info-row">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Primary Crime Vector:</span>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.78rem' }}>{selectedDistrict.topCrime}</span>
              </div>

              <button
                type="button"
                className="btn-query-district glow-button-blue"
                onClick={() => onSelectDistrict && onSelectDistrict(`Show cases registered in ${selectedDistrict.name}`)}
              >
                <TrendingUp size={13} />
                Query {selectedDistrict.name} Database →
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
