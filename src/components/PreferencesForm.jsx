import { useState } from 'react';
import { FL, FI } from '../utils/constants';

export default function PreferencesForm({ initialUser, onSave }) {
  const [form, setForm] = useState({
    budgetMin: initialUser.budgetMin ?? '',
    budgetMax: initialUser.budgetMax ?? '',
    sharing: initialUser.sharing ?? 3,
    people: initialUser.people ?? 3,
    facilities: initialUser.facilities ?? ['wifi', 'food', 'hot_water'],
    liftRequired: initialUser.liftRequired ?? false,
    moveIn: initialUser.moveIn ?? '2026-08-20',
    workLocation: initialUser.workLocation ?? ''
  });

  const toggleFac = (f) => {
    setForm(p => ({
      ...p,
      facilities: p.facilities.includes(f) ? p.facilities.filter(x => x !== f) : [...p.facilities, f]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      budgetMin: form.budgetMin === '' ? null : parseInt(form.budgetMin),
      budgetMax: form.budgetMax === '' ? null : parseInt(form.budgetMax)
    });
  };

  return (
    <div>
      <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>Edit My Preferences</h3>
      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '18px' }}>Update your search filters and matching criteria</p>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="input-g" style={{ flex: 1, margin: 0 }}><label>Min Budget</label><input type="number" placeholder="Min" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} /></div>
          <div className="input-g" style={{ flex: 1, margin: 0 }}><label>Max Budget</label><input type="number" placeholder="Max" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="input-g" style={{ flex: 1, margin: 0 }}><label>Sharing</label><select value={form.sharing} onChange={(e) => setForm({ ...form, sharing: parseInt(e.target.value) })}><option value={1}>1 Sharing</option><option value={2}>2 Sharing</option><option value={3}>3 Sharing</option><option value={4}>4 Sharing</option></select></div>
          <div className="input-g" style={{ flex: 1, margin: 0 }}><label>Group Size</label><input type="number" value={form.people} onChange={(e) => setForm({ ...form, people: parseInt(e.target.value) || 1 })} /></div>
        </div>
        <div className="input-g" style={{ margin: 0 }}><label>Move-in Date</label><input type="date" value={form.moveIn} onChange={(e) => setForm({ ...form, moveIn: e.target.value })} /></div>
        <div className="input-g" style={{ margin: 0 }}><label>Work / College Location</label><input type="text" placeholder="e.g. Madhapur, Hyderabad" value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })} /></div>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>Required Facilities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.keys(FL).map(f => (
              <span key={f} className={`chip ${form.facilities.includes(f) ? 'active' : ''}`} style={{ padding: '6px 10px', fontSize: '11.5px' }} onClick={() => toggleFac(f)}><i className={`fas ${FI[f]}`} style={{ fontSize: '10px' }}></i> {FL[f]}</span>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}><input type="checkbox" checked={form.liftRequired} onChange={(e) => setForm({ ...form, liftRequired: e.target.checked })} style={{ accentColor: 'var(--accent)' }} /> Lift Required</label>
        <button type="submit" className="btn-primary" style={{ marginTop: '6px' }}>SAVE PREFERENCES</button>
      </form>
    </div>
  );
}