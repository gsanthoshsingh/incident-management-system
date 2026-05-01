import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateStatus } from '../api/client';

const CATEGORIES = ['Database Failure', 'Network Outage', 'Memory Leak', 'Deployment Issue', 'Configuration Error', 'Third-party Dependency', 'Hardware Failure', 'Unknown'];

export default function RcaForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ rootCauseCategory: '', fixApplied: '', preventionSteps: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    if (!form.rootCauseCategory || !form.fixApplied || !form.preventionSteps || !form.startTime || !form.endTime) {
      return setError('All fields are required');
    }
    setLoading(true);
    try {
      await updateStatus(id, 'CLOSED', form);
      nav('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to submit RCA');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, marginTop: 6 };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', padding: '32px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <button onClick={() => nav(-1)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          ← Back
        </button>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 10, padding: 32 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 22, marginBottom: 8 }}>Root Cause Analysis</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Complete all fields to close this incident</p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#94a3b8', fontSize: 13 }}>Root Cause Category *</label>
            <select value={form.rootCauseCategory} onChange={e => set('rootCauseCategory', e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 13 }}>Incident Start Time *</label>
              <input type="datetime-local" value={form.startTime} onChange={e => set('startTime', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 13 }}>Incident End Time *</label>
              <input type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#94a3b8', fontSize: 13 }}>Fix Applied *</label>
            <textarea rows={4} value={form.fixApplied} onChange={e => set('fixApplied', e.target.value)} placeholder="Describe what was done to fix the incident..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ color: '#94a3b8', fontSize: 13 }}>Prevention Steps *</label>
            <textarea rows={4} value={form.preventionSteps} onChange={e => set('preventionSteps', e.target.value)} placeholder="Describe steps to prevent this from happening again..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {error && <p style={{ color: '#ff3b3b', fontSize: 13, marginBottom: 16, background: '#ff3b3b11', padding: '10px 14px', borderRadius: 6, border: '1px solid #ff3b3b33' }}>{error}</p>}

          <button onClick={submit} disabled={loading} style={{ width: '100%', background: loading ? '#1e293b' : '#16a34a', color: '#fff', border: 'none', padding: '14px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600 }}>
            {loading ? 'Submitting...' : '✓ Submit RCA & Close Incident'}
          </button>
        </div>
      </div>
    </div>
  );
}