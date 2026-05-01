import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkItem, updateStatus } from '../api/client';

export default function IncidentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await getWorkItem(id);
      setItem(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const advance = async () => {
    const transitions = { OPEN: 'INVESTIGATING', INVESTIGATING: 'RESOLVED', RESOLVED: null };
    const next = transitions[item.status];
    if (!next) return setMsg('Use the RCA form to close this incident');
    try {
      await updateStatus(id, next);
      setMsg(`Status updated to ${next}`);
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!item) return <div style={{ color: '#ff3b3b', padding: 40 }}>Incident not found</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', padding: '32px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <button onClick={() => nav('/')} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          ← Back to Dashboard
        </button>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 10, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 20, color: '#f1f5f9' }}>{item.title}</h2>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>ID: {item.id}</p>
            </div>
            <span style={{ background: '#1e293b', color: '#94a3b8', padding: '4px 12px', borderRadius: 12, fontSize: 13 }}>{item.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Severity: <b style={{ color: '#f1f5f9' }}>{item.severity}</b></span>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Component: <b style={{ color: '#f1f5f9' }}>{item.component_id}</b></span>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Type: <b style={{ color: '#f1f5f9' }}>{item.component_type}</b></span>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            {item.status !== 'CLOSED' && item.status !== 'RESOLVED' && (
              <button onClick={advance} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
                Advance Status →
              </button>
            )}
            {item.status === 'RESOLVED' && (
              <button onClick={() => nav(`/incidents/${id}/rca`)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
                Submit RCA & Close
              </button>
            )}
          </div>
          {msg && <p style={{ marginTop: 12, color: '#ffd700', fontSize: 13 }}>{msg}</p>}
        </div>

        <h3 style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>Raw Signals ({item.signals?.length || 0})</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {(item.signals || []).map(s => (
            <div key={s.signalId} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '10px 14px', marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>{new Date(s.receivedAt).toLocaleTimeString()}</span>
              <span style={{ color: '#94a3b8', marginLeft: 12 }}>{s.errorType}</span>
              <span style={{ color: '#e2e8f0', marginLeft: 12 }}>{s.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}