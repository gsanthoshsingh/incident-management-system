import { useNavigate } from 'react-router-dom';

const SEVERITY_COLORS = { P0: '#ff3b3b', P1: '#ff8c00', P2: '#ffd700', P3: '#00c853' };
const STATUS_COLORS = { OPEN: '#ff3b3b', INVESTIGATING: '#ff8c00', RESOLVED: '#00bcd4', CLOSED: '#4caf50' };

export default function IncidentCard({ item }) {
  const nav = useNavigate();
  const sColor = SEVERITY_COLORS[item.severity] || '#888';
  const stColor = STATUS_COLORS[item.status] || '#888';

  return (
    <div onClick={() => nav(`/incidents/${item.id}`)} style={{
      background: '#111827', border: `1px solid ${sColor}33`,
      borderLeft: `4px solid ${sColor}`, borderRadius: 8,
      padding: '16px 20px', cursor: 'pointer', marginBottom: 12,
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#1a2235'}
    onMouseLeave={e => e.currentTarget.style.background = '#111827'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ background: sColor, color: '#000', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginRight: 8 }}>
            {item.severity}
          </span>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.component_id}</span>
        </div>
        <span style={{ background: stColor + '22', color: stColor, padding: '2px 10px', borderRadius: 12, fontSize: 12, border: `1px solid ${stColor}` }}>
          {item.status}
        </span>
      </div>
      <p style={{ marginTop: 10, color: '#e2e8f0', fontSize: 14 }}>{item.title}</p>
      <p style={{ marginTop: 6, color: '#64748b', fontSize: 11 }}>
        {new Date(item.created_at).toLocaleString()}
      </p>
    </div>
  );
}