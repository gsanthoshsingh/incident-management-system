import { useIncidents } from '../hooks/useIncidents';
import IncidentCard from '../components/IncidentCard';

export default function Dashboard() {
  const { incidents, loading, error, refetch } = useIncidents(5000);

  const counts = incidents.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', letterSpacing: 1 }}>
              ⚡ IMS Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Live incident feed — refreshes every 5s</p>
          </div>
          <button onClick={refetch} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
            ↺ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'].map(s => (
            <div key={s} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{counts[s] || 0}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{s}</div>
            </div>
          ))}
        </div>

        {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>Loading incidents...</p>}
        {error && <p style={{ color: '#ff3b3b', textAlign: 'center' }}>{error}</p>}
        {!loading && incidents.length === 0 && (
          <p style={{ color: '#64748b', textAlign: 'center', marginTop: 60 }}>No incidents found. System is healthy ✅</p>
        )}

        {incidents
          .sort((a, b) => { const order = { P0: 0, P1: 1, P2: 2, P3: 3 }; return (order[a.severity] || 3) - (order[b.severity] || 3); })
          .map(item => <IncidentCard key={item.id} item={item} />)
        }
      </div>
    </div>
  );
}