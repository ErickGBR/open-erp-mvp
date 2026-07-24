'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Building2, Save } from 'lucide-react';

interface CompanyData {
  id: number;
  name: string;
  nit: string | null;
  nrc: string | null;
  npe: string | null;
  commercialName: string | null;
  economicActivity: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  currency: string;
  taxRate: number;
}

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState({
    name: '', commercialName: '', nit: '', nrc: '', npe: '',
    economicActivity: '', address: '', phone: '', email: '', website: '',
    taxRate: 13,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<CompanyData>('/company').then(data => {
      setCompany(data);
      setForm({
        name: data.name,
        commercialName: data.commercialName || '',
        nit: data.nit || '',
        nrc: data.nrc || '',
        npe: data.npe || '',
        economicActivity: data.economicActivity || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        taxRate: data.taxRate,
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch('/company', {
        name: form.name,
        commercialName: form.commercialName || undefined,
        nit: form.nit || undefined,
        nrc: form.nrc || undefined,
        npe: form.npe || undefined,
        economicActivity: form.economicActivity || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        taxRate: Number(form.taxRate) || 13,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (!company) return <div className="text-text-secondary p-8">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-text-primary">Company Settings (DTE)</h1>
      </div>

      <div className="card space-y-4">
        <p className="text-xs text-text-secondary">This data will be used for El Salvador DTE electronic invoicing.</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Company Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Commercial Name</label>
            <input value={form.commercialName} onChange={e => setForm({...form, commercialName: e.target.value})}
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">NIT</label>
            <input value={form.nit} onChange={e => setForm({...form, nit: e.target.value})}
              placeholder="1234-567890-123-4"
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">NRC</label>
            <input value={form.nrc} onChange={e => setForm({...form, nrc: e.target.value})}
              placeholder="123456-7"
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">NPE (Emission Point)</label>
            <input value={form.npe} onChange={e => setForm({...form, npe: e.target.value})}
              placeholder="001"
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary font-mono" />
          </div>
        </div>

        <div>
          <label className="text-xs text-text-secondary mb-1 block">Economic Activity</label>
          <input value={form.economicActivity} onChange={e => setForm({...form, economicActivity: e.target.value})}
            className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
        </div>

        <div>
          <label className="text-xs text-text-secondary mb-1 block">Address (Branch / Headquarters)</label>
          <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
            className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Email</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">VAT (%)</label>
            <input type="number" step="0.01" value={form.taxRate} onChange={e => setForm({...form, taxRate: Number(e.target.value) || 0})}
              className="w-full rounded-lg bg-surface-hover border border-border px-3 py-2 text-sm text-text-primary" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Configuration'}
        </button>
        {saved && <p className="text-xs text-success">Configuration saved</p>}
      </div>
    </div>
  );
}
